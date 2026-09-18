#!/bin/bash

set -e

# ============================================================
# Job Application Tracker CLI
#
# Required:
#   --company
#   --title
#
# Optional:
#   --reference
#   --location
#   --salary
#   --url
#   --date-applied
#   --closing-date
#   --status
#   --contact-person
#   --contact-email
#   --notes
#   --job-description-file
#
# Resume and cover letter are automatically copied from:
#   /Users/arslan/Documents/CVs/Resume.pdf
#   /Users/arslan/Documents/CVs/Cover letter.pdf
#
# Follow-up:
#   Closing date exists -> +3 days from closing date
#   No closing date     -> +3 days from application date
# ============================================================

set -e

# ------------------------------------------------------------
# Fixed paths
# ------------------------------------------------------------

SOURCE_RESUME="/Users/arslan/Documents/CVs/Resume.pdf"
SOURCE_COVER="/Users/arslan/Documents/CVs/Cover letter.pdf"

UPLOADS_DIR="./uploads"
DB_PATH="./data/jobs.db"

# ------------------------------------------------------------
# Defaults
# ------------------------------------------------------------

COMPANY=""
JOB_TITLE=""
JOB_REFERENCE=""
LOCATION=""
SALARY=""
JOB_URL=""
DATE_APPLIED="$(date "+%Y-%m-%d")"
CLOSING_DATE=""
STATUS="Applied"
CONTACT_PERSON=""
CONTACT_EMAIL=""
NOTES=""
JOB_DESCRIPTION_FILE=""

# ------------------------------------------------------------
# Help
# ------------------------------------------------------------

show_help() {
    echo ""
    echo "Usage:"
    echo ""
    echo "./scripts/add-job.sh [options]"
    echo ""
    echo "Required:"
    echo "  --company VALUE"
    echo "  --title VALUE"
    echo ""
    echo "Optional:"
    echo "  --reference VALUE"
    echo "  --location VALUE"
    echo "  --salary VALUE"
    echo "  --url VALUE"
    echo "  --date-applied YYYY-MM-DD"
    echo "  --closing-date YYYY-MM-DD"
    echo "  --status VALUE"
    echo "  --contact-person VALUE"
    echo "  --contact-email VALUE"
    echo "  --notes VALUE"
    echo "  --job-description-file VALUE"
    echo ""
    echo "Example:"
    echo './scripts/add-job.sh \'
    echo '  --company "Addepar" \'
    echo '  --title "Sr. Software Engineer, Investor Solutions" \'
    echo '  --reference "bb33e20b2c1a4eea9396dfbaafe2ffa5" \'
    echo '  --location "Edinburgh, UK" \'
    echo '  --url "https://www.s1jobs.com/job/software-engineer-investor-solutions-127350582" \'
    echo '  --date-applied "2026-09-18"'
    echo ""
}

# ------------------------------------------------------------
# Parse arguments
# ------------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case "$1" in
        --company)
            COMPANY="$2"
            shift 2
            ;;

        --title)
            JOB_TITLE="$2"
            shift 2
            ;;

        --reference)
            JOB_REFERENCE="$2"
            shift 2
            ;;

        --location)
            LOCATION="$2"
            shift 2
            ;;

        --salary)
            SALARY="$2"
            shift 2
            ;;

        --url)
            JOB_URL="$2"
            shift 2
            ;;

        --date-applied)
            DATE_APPLIED="$2"
            shift 2
            ;;

        --closing-date)
            CLOSING_DATE="$2"
            shift 2
            ;;

        --status)
            STATUS="$2"
            shift 2
            ;;

        --contact-person)
            CONTACT_PERSON="$2"
            shift 2
            ;;

        --contact-email)
            CONTACT_EMAIL="$2"
            shift 2
            ;;

        --notes)
            NOTES="$2"
            shift 2
            ;;

        --job-description-file)
            JOB_DESCRIPTION_FILE="$2"
            shift 2
            ;;

        --help|-h)
            show_help
            exit 0
            ;;

        *)
            echo "❌ Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
done

# ------------------------------------------------------------
# Required fields
# ------------------------------------------------------------

if [[ -z "$COMPANY" ]]; then
    echo "❌ --company is required."
    exit 1
fi

if [[ -z "$JOB_TITLE" ]]; then
    echo "❌ --title is required."
    exit 1
fi

# ------------------------------------------------------------
# Check required files
# ------------------------------------------------------------

if [[ ! -f "$SOURCE_RESUME" ]]; then
    echo "❌ Resume not found:"
    echo "$SOURCE_RESUME"
    exit 1
fi

if [[ ! -f "$SOURCE_COVER" ]]; then
    echo "❌ Cover letter not found:"
    echo "$SOURCE_COVER"
    exit 1
fi

if [[ ! -f "$DB_PATH" ]]; then
    echo "❌ Database not found:"
    echo "$DB_PATH"
    exit 1
fi

mkdir -p "$UPLOADS_DIR"

# ------------------------------------------------------------
# Generate unique filenames
# ------------------------------------------------------------

SAFE_COMPANY=$(printf "%s" "$COMPANY" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/_/g' \
    | sed 's/__*/_/g' \
    | sed 's/^_//;s/_$//')

TIMESTAMP="$(date "+%Y%m%d_%H%M%S")"

RESUME_FILENAME="Resume_${SAFE_COMPANY}_${TIMESTAMP}.pdf"
COVER_FILENAME="Cover_letter_${SAFE_COMPANY}_${TIMESTAMP}.pdf"

RESUME_PATH="uploads/$RESUME_FILENAME"
COVER_PATH="uploads/$COVER_FILENAME"

# ------------------------------------------------------------
# Copy latest files
# ------------------------------------------------------------

cp "$SOURCE_RESUME" "$UPLOADS_DIR/$RESUME_FILENAME"
cp "$SOURCE_COVER" "$UPLOADS_DIR/$COVER_FILENAME"

# ------------------------------------------------------------
# Calculate follow-up date
# ------------------------------------------------------------

if [[ -n "$CLOSING_DATE" ]]; then

    FOLLOW_UP_DATE=$(date -j -v+3d -f "%Y-%m-%d" "$CLOSING_DATE" "+%Y-%m-%d")

    FOLLOW_UP_NOTE="Closing date $CLOSING_DATE. Follow up 3 days after closing date if no update is received."

else

    FOLLOW_UP_DATE=$(date -j -v+3d -f "%Y-%m-%d" "$DATE_APPLIED" "+%Y-%m-%d")

    FOLLOW_UP_NOTE="No closing date specified. Follow up 3 days after application if no update is received."

fi

# ------------------------------------------------------------
# Escape SQL values safely
# ------------------------------------------------------------

sql_escape() {
    printf "%s" "$1" | sed "s/'/''/g"
}

SQL_COMPANY=$(sql_escape "$COMPANY")
SQL_JOB_TITLE=$(sql_escape "$JOB_TITLE")
SQL_REFERENCE=$(sql_escape "$JOB_REFERENCE")
SQL_LOCATION=$(sql_escape "$LOCATION")
SQL_SALARY=$(sql_escape "$SALARY")
SQL_URL=$(sql_escape "$JOB_URL")
SQL_DATE_APPLIED=$(sql_escape "$DATE_APPLIED")
SQL_CLOSING_DATE=$(sql_escape "$CLOSING_DATE")
SQL_STATUS=$(sql_escape "$STATUS")
SQL_CONTACT_PERSON=$(sql_escape "$CONTACT_PERSON")
SQL_CONTACT_EMAIL=$(sql_escape "$CONTACT_EMAIL")
SQL_NOTES=$(sql_escape "$NOTES")
SQL_JOB_DESCRIPTION_FILE=$(sql_escape "$JOB_DESCRIPTION_FILE")
SQL_FOLLOW_UP_NOTE=$(sql_escape "$FOLLOW_UP_NOTE")

# ------------------------------------------------------------
# Insert application + follow-up in ONE transaction
# ------------------------------------------------------------

if ! sqlite3 "$DB_PATH" <<SQL
BEGIN;

INSERT INTO applications (
    company,
    job_title,
    job_reference,
    location,
    salary,
    job_url,
    date_applied,
    closing_date,
    status,
    contact_person,
    contact_email,
    notes,
    resume_file,
    cover_letter_file,
    job_description_file
)
VALUES (
    NULLIF('$SQL_COMPANY', ''),
    NULLIF('$SQL_JOB_TITLE', ''),
    NULLIF('$SQL_REFERENCE', ''),
    NULLIF('$SQL_LOCATION', ''),
    NULLIF('$SQL_SALARY', ''),
    NULLIF('$SQL_URL', ''),
    '$SQL_DATE_APPLIED',
    NULLIF('$SQL_CLOSING_DATE', ''),
    NULLIF('$SQL_STATUS', ''),
    NULLIF('$SQL_CONTACT_PERSON', ''),
    NULLIF('$SQL_CONTACT_EMAIL', ''),
    NULLIF('$SQL_NOTES', ''),
    '$RESUME_PATH',
    '$COVER_PATH',
    NULLIF('$SQL_JOB_DESCRIPTION_FILE', '')
);

INSERT INTO follow_ups (
    application_id,
    follow_up_date,
    status,
    notes
)
VALUES (
    last_insert_rowid(),
    '$FOLLOW_UP_DATE',
    'Planned',
    '$SQL_FOLLOW_UP_NOTE'
);

COMMIT;
SQL
then
    echo "❌ Database insertion failed."
    rm -f "$UPLOADS_DIR/$RESUME_FILENAME"
    rm -f "$UPLOADS_DIR/$COVER_FILENAME"
    exit 1
fi

# ------------------------------------------------------------
# Display result
# ------------------------------------------------------------

echo ""
echo "=========================================="
echo "✅ JOB APPLICATION ADDED"
echo "=========================================="
echo ""
echo "Company:       $COMPANY"
echo "Job:           $JOB_TITLE"

[[ -n "$JOB_REFERENCE" ]] && echo "Reference:     $JOB_REFERENCE"
[[ -n "$LOCATION" ]] && echo "Location:      $LOCATION"
[[ -n "$SALARY" ]] && echo "Salary:        $SALARY"
[[ -n "$JOB_URL" ]] && echo "URL:           $JOB_URL"

echo "Applied:       $DATE_APPLIED"

if [[ -n "$CLOSING_DATE" ]]; then
    echo "Closing:       $CLOSING_DATE"
else
    echo "Closing:       Not specified"
fi

echo "Follow-up:     $FOLLOW_UP_DATE"
echo "Status:        $STATUS"
echo ""
echo "Resume:        $RESUME_PATH"
echo "Cover Letter:  $COVER_PATH"
echo ""
echo "=========================================="
