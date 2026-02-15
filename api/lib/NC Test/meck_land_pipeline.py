#!/usr/bin/env python3
import hashlib
import json
import os
import re
import smtplib
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import EmailMessage
from typing import Any, Dict, Iterable, List, Optional

import gspread
import requests
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
from google.oauth2.service_account import Credentials
from shapely.geometry import Point, Polygon
from shapely.strtree import STRtree


SHEETS_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


@dataclass
class Config:
    vacant_layer_url: str
    zoning_layer_url: str
    min_acres: float
    max_acres: float
    min_years_owned: int
    residential_zone_regex: str
    corporate_keywords: List[str]
    spreadsheet_title: str
    service_account_json: str
    va_email_to: List[str]
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_from: str


def load_config() -> Config:
    load_dotenv()
    keywords = [
        x.strip().upper()
        for x in os.getenv("CORPORATE_KEYWORDS", "").split(",")
        if x.strip()
    ]
    va_email_to = [x.strip() for x in os.getenv("VA_EMAIL_TO", "").split(",") if x.strip()]
    return Config(
        vacant_layer_url=os.getenv(
            "GIS_VACANT_LAYER_URL",
            "https://gis.charlottenc.gov/arcgis/rest/services/PLN/VacantLand/MapServer/0/query",
        ),
        zoning_layer_url=os.getenv(
            "GIS_ZONING_LAYER_URL",
            "https://gis.charlottenc.gov/arcgis/rest/services/PLN/Zoning/MapServer/0/query",
        ),
        min_acres=float(os.getenv("MIN_ACRES", "0.1")),
        max_acres=float(os.getenv("MAX_ACRES", "0.8")),
        min_years_owned=int(os.getenv("MIN_YEARS_OWNED", "10")),
        residential_zone_regex=os.getenv(
            "RESIDENTIAL_ZONE_REGEX",
            r"(?i)\b(R-\d+|N1-[A-Z]?|N2-[A-Z]?|N3-[A-Z]?|UR-[A-Z]?|RE-\d+)\b",
        ),
        corporate_keywords=keywords,
        spreadsheet_title=os.getenv(
            "GOOGLE_SHEETS_SPREADSHEET_TITLE", "Daily Leads"
        ),
        service_account_json=os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip(),
        va_email_to=va_email_to,
        smtp_host=os.getenv("SMTP_HOST", "").strip(),
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_user=os.getenv("SMTP_USER", "").strip(),
        smtp_password=os.getenv("SMTP_PASSWORD", "").strip(),
        smtp_from=os.getenv("SMTP_FROM", "").strip(),
    )


class AttrMap:
    def __init__(self, attrs: Dict[str, Any]):
        self.raw = attrs
        self.lower = {k.lower(): v for k, v in attrs.items()}

    def get(self, *keys: str) -> Any:
        for key in keys:
            if key.lower() in self.lower:
                return self.lower[key.lower()]
        return None


def arcgis_query_all(
    url: str,
    where: str = "1=1",
    out_fields: str = "*",
    return_geometry: bool = False,
    batch_size: int = 2000,
) -> List[Dict[str, Any]]:
    offset = 0
    all_features: List[Dict[str, Any]] = []
    while True:
        params = {
            "f": "json",
            "where": where,
            "outFields": out_fields,
            "returnGeometry": str(return_geometry).lower(),
            "outSR": "2264",
            "resultOffset": offset,
            "resultRecordCount": batch_size,
        }
        r = requests.get(url, params=params, timeout=60)
        r.raise_for_status()
        payload = r.json()
        if "error" in payload:
            raise RuntimeError(f"ArcGIS error from {url}: {payload['error']}")
        features = payload.get("features", [])
        all_features.extend(features)
        if len(features) < batch_size:
            break
        offset += batch_size
    return all_features


def rings_to_polygons(rings: Any) -> List[Polygon]:
    if not isinstance(rings, list):
        return []
    polygons: List[Polygon] = []
    for ring in rings:
        if not isinstance(ring, list) or len(ring) < 4:
            continue
        try:
            poly = Polygon(ring)
            if poly.is_valid and not poly.is_empty:
                polygons.append(poly)
        except Exception:
            continue
    return polygons


def centroid_from_geometry(geom: Dict[str, Any]) -> Optional[Point]:
    rings = geom.get("rings")
    polygons = rings_to_polygons(rings)
    if not polygons:
        return None
    # Multi-part polygons in this service are represented as rings; centroid on union is sufficient here.
    merged = polygons[0]
    for poly in polygons[1:]:
        merged = merged.union(poly)
    if merged.is_empty:
        return None
    return merged.centroid


def is_residential_zone(attrs: Dict[str, Any], zone_re: re.Pattern) -> bool:
    for k, v in attrs.items():
        if v is None:
            continue
        key = k.lower()
        if "zone" not in key and "district" not in key and "class" not in key:
            continue
        value = str(v).strip()
        if not value:
            continue
        if zone_re.search(value):
            return True
    return False


def build_residential_zoning_index(
    zoning_features: List[Dict[str, Any]], zone_re: re.Pattern
) -> Optional[STRtree]:
    residential_polys: List[Polygon] = []
    for feature in zoning_features:
        attrs = feature.get("attributes", {}) or {}
        if not is_residential_zone(attrs, zone_re):
            continue
        geom = feature.get("geometry", {}) or {}
        rings = geom.get("rings")
        residential_polys.extend(rings_to_polygons(rings))
    if not residential_polys:
        return None
    return STRtree(residential_polys)


def is_individual_owner(owner_name: str, ownertype: str, keywords: Iterable[str]) -> bool:
    text = f"{owner_name} {ownertype}".upper()
    if ownertype and "INDIV" in ownertype.upper():
        return True
    for kw in keywords:
        if kw and re.search(rf"\b{re.escape(kw)}\b", text):
            return False
    return True


def to_iso_date(val: Any) -> str:
    if val is None or val == "":
        return ""
    try:
        # ArcGIS date fields are epoch milliseconds.
        if isinstance(val, (int, float)) and val > 10_000_000:
            dt = datetime.fromtimestamp(val / 1000, tz=timezone.utc)
            return dt.date().isoformat()
        dt = datetime.fromisoformat(str(val))
        return dt.date().isoformat()
    except Exception:
        return ""


def build_owner_name(a: AttrMap) -> str:
    if a.get("owner_name"):
        return str(a.get("owner_name")).strip()
    parts = [
        str(a.get("ownfirstn") or "").strip(),
        str(a.get("ownmidin") or "").strip(),
        str(a.get("ownlastn") or "").strip(),
    ]
    owner = " ".join([x for x in parts if x])
    co = str(a.get("coownlastn") or "").strip()
    if co:
        owner = f"{owner} / {co}".strip(" /")
    return owner


def line_join(parts: List[str]) -> str:
    return " ".join([p for p in parts if p]).strip()


def compute_years_owned(date_iso: str) -> int:
    if not date_iso:
        return 0
    try:
        owned_date = datetime.fromisoformat(date_iso).date()
        return relativedelta(datetime.now(timezone.utc).date(), owned_date).years
    except Exception:
        return 0


def row_hash(record: Dict[str, Any]) -> str:
    keys = [
        "parcel_id",
        "owner_name",
        "mailing_address",
        "property_address",
        "acres",
        "vacant_flag",
        "zoning_label",
        "last_sale_date",
        "years_owned",
    ]
    payload = "|".join(str(record.get(k, "")) for k in keys)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def build_record(feature: Dict[str, Any]) -> Dict[str, Any]:
    attrs = AttrMap(feature.get("attributes", {}) or {})
    parcel_id = str(attrs.get("taxpid", "pid", "parcel_id", "nc_pin") or "").strip()
    owner_name = build_owner_name(attrs)
    ownertype = str(attrs.get("ownertype") or "").strip()
    acres = attrs.get("totalac", "acres", "land_acres")
    try:
        acres = float(acres) if acres is not None and str(acres).strip() != "" else 0.0
    except Exception:
        acres = 0.0

    sale_date = to_iso_date(attrs.get("dateofsale", "sale_date", "deed_date"))
    years_owned = compute_years_owned(sale_date)
    mailing_address = line_join(
        [
            str(attrs.get("ownstreetn") or "").strip(),
            str(attrs.get("owncity") or "").strip(),
            str(attrs.get("ownstate") or "").strip(),
            str(attrs.get("ownzip") or "").strip(),
        ]
    )
    property_address = line_join(
        [
            str(attrs.get("houseno") or "").strip(),
            str(attrs.get("predirect") or "").strip(),
            str(attrs.get("stname") or "").strip(),
            str(attrs.get("stsufix") or "").strip(),
            str(attrs.get("municode") or "").strip(),
            str(attrs.get("zipcode") or "").strip(),
        ]
    )
    zoning_label = str(
        attrs.get("descpropertyuse", "propertyuse", "zoning", "zone") or ""
    ).strip()
    vacant_flag = str(attrs.get("vacantorimproved", "vacant_flag") or "").strip()

    record = {
        "county": "Mecklenburg",
        "parcel_id": parcel_id,
        "owner_name": owner_name,
        "owner_type": ownertype,
        "mailing_address": mailing_address,
        "property_address": property_address,
        "acres": acres,
        "vacant_flag": vacant_flag,
        "zoning_label": zoning_label,
        "last_sale_date": sale_date,
        "years_owned": years_owned,
        "source_url": "https://gis.charlottenc.gov/arcgis/rest/services/PLN/VacantLand/MapServer/0",
        "pulled_at_utc": datetime.now(timezone.utc).isoformat(),
        "_geometry": feature.get("geometry", {}) or {},
    }
    record["data_hash"] = row_hash(record)
    return record


def get_sheet_client(service_account_json: str) -> gspread.Client:
    if not service_account_json:
        raise ValueError("GOOGLE_SERVICE_ACCOUNT_JSON is required")
    info = json.loads(service_account_json)
    creds = Credentials.from_service_account_info(info, scopes=SHEETS_SCOPES)
    return gspread.authorize(creds)


def get_or_create_spreadsheet(gc: gspread.Client, title: str) -> gspread.Spreadsheet:
    try:
        return gc.open(title)
    except gspread.SpreadsheetNotFound:
        return gc.create(title)


def get_or_create_worksheet(
    spreadsheet: gspread.Spreadsheet, title: str, rows: int = 2000, cols: int = 30
) -> gspread.Worksheet:
    try:
        return spreadsheet.worksheet(title)
    except gspread.WorksheetNotFound:
        return spreadsheet.add_worksheet(title=title, rows=rows, cols=cols)


def normalize_key(record: Dict[str, Any]) -> str:
    return f"{record.get('county', '').strip()}::{record.get('parcel_id', '').strip()}"


def send_email_if_configured(config: Config, summary: str) -> None:
    if not (
        config.va_email_to
        and config.smtp_host
        and config.smtp_user
        and config.smtp_password
        and config.smtp_from
    ):
        return
    msg = EmailMessage()
    msg["Subject"] = "Daily Mecklenburg Vacant Land Lead Update"
    msg["From"] = config.smtp_from
    msg["To"] = ", ".join(config.va_email_to)
    msg.set_content(summary)
    with smtplib.SMTP(config.smtp_host, config.smtp_port, timeout=30) as smtp:
        smtp.starttls()
        smtp.login(config.smtp_user, config.smtp_password)
        smtp.send_message(msg)


def main() -> None:
    config = load_config()
    zone_re = re.compile(config.residential_zone_regex)

    print("Pulling Mecklenburg vacant land features...")
    parcel_features = arcgis_query_all(config.vacant_layer_url, return_geometry=True)
    print(f"Pulled {len(parcel_features)} parcel features")

    print("Pulling Mecklenburg zoning features...")
    zoning_features = arcgis_query_all(config.zoning_layer_url, return_geometry=True)
    zoning_index = build_residential_zoning_index(zoning_features, zone_re)
    print(f"Pulled {len(zoning_features)} zoning features")

    leads: List[Dict[str, Any]] = []
    for feature in parcel_features:
        record = build_record(feature)
        if not record["parcel_id"]:
            continue
        if not (config.min_acres <= float(record["acres"]) <= config.max_acres):
            continue
        if int(record["years_owned"]) < config.min_years_owned:
            continue
        if not is_individual_owner(
            record["owner_name"], record["owner_type"], config.corporate_keywords
        ):
            continue
        # VacantLand layer should already be vacant, but keep this guard.
        if record["vacant_flag"] and "VAC" not in record["vacant_flag"].upper():
            continue

        is_res_zone = False
        centroid = centroid_from_geometry(record.get("_geometry", {}))
        if centroid is not None and zoning_index is not None:
            matches = zoning_index.query(centroid, predicate="intersects")
            is_res_zone = len(matches) > 0
        else:
            # Fallback if geometry/zoning lookup fails: use textual field on parcel.
            is_res_zone = bool(zone_re.search(record.get("zoning_label", "")))

        if not is_res_zone:
            continue

        record["residential_zone_match"] = "yes"
        leads.append(record)

    print(f"Filtered leads: {len(leads)}")

    gc = get_sheet_client(config.service_account_json)
    spreadsheet = get_or_create_spreadsheet(gc, config.spreadsheet_title)
    master_ws = get_or_create_worksheet(spreadsheet, "master", rows=5000, cols=40)
    queue_ws = get_or_create_worksheet(spreadsheet, "va_queue", rows=5000, cols=40)
    runlog_ws = get_or_create_worksheet(spreadsheet, "run_log", rows=1000, cols=15)

    existing_rows = master_ws.get_all_records()
    existing_by_key = {
        normalize_key(r): r
        for r in existing_rows
        if r.get("county") and r.get("parcel_id")
    }

    new_count = 0
    updated_count = 0
    unchanged_count = 0

    out_rows: List[Dict[str, Any]] = []
    run_ts = datetime.now(timezone.utc).isoformat()

    for record in leads:
        key = normalize_key(record)
        existing = existing_by_key.get(key)
        if existing is None:
            record_status = "new"
            new_count += 1
            va_status = "Ready to Mail"
            notes = ""
        else:
            old_hash = str(existing.get("data_hash", ""))
            if old_hash and old_hash != record["data_hash"]:
                record_status = "updated"
                updated_count += 1
            else:
                record_status = "unchanged"
                unchanged_count += 1
            va_status = str(existing.get("va_status", "") or "")
            notes = str(existing.get("notes", "") or "")

        merged = {
            **record,
            "record_status": record_status,
            "last_seen_at_utc": run_ts,
            "va_status": va_status,
            "notes": notes,
        }
        merged.pop("_geometry", None)
        out_rows.append(merged)

    headers = [
        "county",
        "parcel_id",
        "owner_name",
        "owner_type",
        "mailing_address",
        "property_address",
        "acres",
        "vacant_flag",
        "zoning_label",
        "residential_zone_match",
        "last_sale_date",
        "years_owned",
        "source_url",
        "pulled_at_utc",
        "last_seen_at_utc",
        "record_status",
        "data_hash",
        "va_status",
        "notes",
    ]

    sorted_rows = sorted(
        out_rows, key=lambda x: (x.get("record_status", ""), x.get("parcel_id", ""))
    )
    master_values = [headers] + [
        [str(row.get(h, "")) for h in headers] for row in sorted_rows
    ]
    master_ws.clear()
    master_ws.update(master_values, "A1")

    queue_rows = [r for r in sorted_rows if r["record_status"] in {"new", "updated"}]
    queue_values = [headers] + [[str(row.get(h, "")) for h in headers] for row in queue_rows]
    queue_ws.clear()
    queue_ws.update(queue_values, "A1")

    runlog_headers = [
        "run_at_utc",
        "total_pulled",
        "total_filtered",
        "new_count",
        "updated_count",
        "unchanged_count",
        "spreadsheet_url",
    ]
    if not runlog_ws.get_all_values():
        runlog_ws.update([runlog_headers], "A1")
    runlog_ws.append_row(
        [
            run_ts,
            len(parcel_features),
            len(leads),
            new_count,
            updated_count,
            unchanged_count,
            spreadsheet.url,
        ],
        value_input_option="USER_ENTERED",
    )

    summary = (
        f"Run time (UTC): {run_ts}\n"
        f"Pulled: {len(parcel_features)}\n"
        f"Filtered leads: {len(leads)}\n"
        f"New: {new_count}\n"
        f"Updated: {updated_count}\n"
        f"Unchanged: {unchanged_count}\n"
        f"VA Queue rows: {len(queue_rows)}\n"
        f"Spreadsheet: {spreadsheet.url}\n"
    )
    print(summary)
    send_email_if_configured(config, summary)


if __name__ == "__main__":
    main()
