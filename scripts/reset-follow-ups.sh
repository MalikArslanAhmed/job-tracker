#!/bin/bash

set -e

DB_PATH="./data/jobs.db"

if [[ ! -f "$DB_PATH" ]]; then
    echo "❌ Database not found:"
    echo "$DB_PATH"
    exit 1
fi

echo "=========================================="
echo "🔄 RESETTING FOLLOW-UP SYSTEM"
echo "=========================================="
echo ""

echo "Creating database backup..."

cp "$DB_PATH" "$DB_PATH.backup-before-followup-reset"

echo "✅ Backup created:"
echo "$DB_PATH.backup-before-followup-reset"
echo ""

echo "Rebuilding follow_ups table..."

sqlite3 "$DB_PATH" <<'SQL'

BEGIN;

DROP TABLE IF EXISTS follow_ups;

CREATE TABLE follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    follow_up_number INTEGER NOT NULL DEFAULT 1,
    follow_up_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned',
    response_status TEXT NOT NULL DEFAULT 'Waiting',
    sent_at TEXT,
    responded_at TEXT,
    email_to TEXT,
    email_subject TEXT,
    email_message TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE
);

COMMIT;

SQL

echo "✅ New follow_ups table created."
echo ""

echo "Adding automatic follow-up settings to applications..."

sqlite3 "$DB_PATH" <<'SQL'
ALTER TABLE applications
ADD COLUMN follow_up_enabled INTEGER NOT NULL DEFAULT 1;
SQL

sqlite3 "$DB_PATH" <<'SQL'
ALTER TABLE applications
ADD COLUMN max_follow_ups INTEGER NOT NULL DEFAULT 3;
SQL

sqlite3 "$DB_PATH" <<'SQL'
ALTER TABLE applications
ADD COLUMN follow_up_wait_days INTEGER NOT NULL DEFAULT 4;
SQL

echo "✅ Follow-up settings added."
echo ""

echo "Creating first automatic follow-up for every application..."
echo "Using 3 BUSINESS days after closing/application date."
echo ""

sqlite3 "$DB_PATH" <<'SQL'

WITH RECURSIVE business_days(application_id, base_date, candidate_date, business_days_added) AS (

    SELECT
        id,
        CASE
            WHEN closing_date IS NOT NULL AND closing_date != ''
            THEN date(closing_date)
            ELSE date(date_applied)
        END,
        CASE
            WHEN closing_date IS NOT NULL AND closing_date != ''
            THEN date(closing_date)
            ELSE date(date_applied)
        END,
        0
    FROM applications

    UNION ALL

    SELECT
        application_id,
        base_date,
        date(candidate_date, '+1 day'),
        business_days_added +
            CASE
                WHEN strftime('%w', date(candidate_date, '+1 day'))
                     NOT IN ('0', '6')
                THEN 1
                ELSE 0
            END
    FROM business_days
    WHERE business_days_added < 3
)

INSERT INTO follow_ups (
    application_id,
    follow_up_number,
    follow_up_date,
    status,
    response_status,
    notes
)
SELECT
    applications.id,
    1,
    MAX(business_days.candidate_date),
    'Planned',
    'Waiting',

    CASE
        WHEN applications.closing_date IS NOT NULL
             AND applications.closing_date != ''
        THEN 'Automatically planned 3 business days after closing date.'
        ELSE 'Automatically planned 3 business days after application date.'
    END

FROM applications
JOIN business_days
    ON business_days.application_id = applications.id

GROUP BY applications.id;

SQL

echo "✅ First follow-up created for every application."
echo ""

echo "=========================================="
echo "📊 FOLLOW-UP SUMMARY"
echo "=========================================="
echo ""

echo "Applications:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM applications;"

echo ""

echo "Follow-ups:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM follow_ups;"

echo ""

echo "Follow-up details:"
sqlite3 "$DB_PATH" <<'SQL'
SELECT
    follow_ups.id,
    applications.company,
    applications.job_title,
    follow_ups.follow_up_number,
    follow_ups.follow_up_date,
    follow_ups.status,
    follow_ups.response_status
FROM follow_ups
JOIN applications
    ON applications.id = follow_ups.application_id
ORDER BY follow_ups.follow_up_date ASC;
SQL

echo ""
echo "=========================================="
echo "✅ FOLLOW-UP RESET COMPLETE"
echo "=========================================="
echo ""
echo "Backup:"
echo "$DB_PATH.backup-before-followup-reset"
echo ""