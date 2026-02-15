# Mecklenburg Vacant Land Owner Pipeline

Daily Python workflow to pull Mecklenburg County GIS parcel data, filter for target leads, sync to Google Sheets, and notify your VA.

## What this pipeline does

- Pulls parcel records from Mecklenburg GIS `PLN/VacantLand` ArcGIS layer
- Pulls zoning polygons from Mecklenburg GIS `PLN/Zoning` ArcGIS layer
- Filters to:
  - `0.1` to `0.8` acres
  - Owned `10+` years
  - Individual owners only (excludes corporate/entity owners)
  - Vacant land
  - Residential zoning (heuristic via zoning attributes)
- Writes to a new Google Sheet with tabs:
  - `master`
  - `va_queue`
  - `run_log`
- Tracks both `new` and `updated` records each run
- Sends optional daily email summary to your VA

## Project files

- `meck_land_pipeline.py` main script
- `.github/workflows/daily_meck_land.yml` scheduled GitHub Action
- `.env.example` local environment template
- `requirements.txt` dependencies

## Setup

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create `.env` from `.env.example` and fill values (defaults include `Daily Leads` and `emanuel@birdbuysllc.com`).
4. Run locally:

```bash
python meck_land_pipeline.py
```

## Google Sheets setup

1. Create a Google Cloud service account.
2. Enable Google Sheets API + Drive API.
3. Download the service account JSON and set it as `GOOGLE_SERVICE_ACCOUNT_JSON` (single-line JSON string).
4. Share the destination spreadsheet with the service account email.

If the spreadsheet does not exist, the script creates one using `GOOGLE_SHEETS_SPREADSHEET_TITLE`.

## GitHub Actions setup

Create repository secrets:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_SHEETS_SPREADSHEET_TITLE` (set to `Daily Leads`)
- `VA_EMAIL_TO` (set to `emanuel@birdbuysllc.com`)
- Optional email secrets:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASSWORD`
  - `SMTP_FROM`

Then push this repo. The workflow runs daily on cron and also supports manual `workflow_dispatch`.

## Notes

- Source endpoints are public ArcGIS REST services:
  - `https://gis.charlottenc.gov/arcgis/rest/services/PLN/VacantLand/MapServer/0/query`
  - `https://gis.charlottenc.gov/arcgis/rest/services/PLN/Zoning/MapServer/0/query`
- Residential zoning detection is heuristic and configurable with `RESIDENTIAL_ZONE_REGEX`.
- Corporate-owner filtering is keyword-based and configurable with `CORPORATE_KEYWORDS`.
- For Gmail SMTP use: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, and an app password for `SMTP_PASSWORD`.
