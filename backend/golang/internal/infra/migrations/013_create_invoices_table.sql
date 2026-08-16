CREATE TABLE IF NOT EXISTS billing_periods (
    "id"                        UUID      PRIMARY KEY  NOT NULL,

    "starts_at"                 TIMESTAMP              NOT NULL,
    "ends_at"                   TIMESTAMP              NOT NULL,

    "status"                    INT                    NOT NULL, -- OPEN, CLOSED

    "created_at"                TIMESTAMP              NOT NULL,
    "updated_at"                TIMESTAMP              NOT NULL,
    "closed_at"                 TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    "id"                        UUID      PRIMARY KEY  NOT NULL,
    "number"                    INT                    NOT NULL,
    "specialist_id"             UUID                   NOT NULL,
    "billing_period_id"         UUID                   NOT NULL,

    "status"                    INT                    NOT NULL, -- DRAFT, UNDER_REVIEW, APPROVED, FINALIZED, SENT, REJECTED, CANCELED

    "generated_at"              TIMESTAMP              NOT NULL, -- like CREATED_AT
    "reviewed_at"               TIMESTAMP,
    "approved_at"               TIMESTAMP,
    "finalized_at"              TIMESTAMP,
    "sent_at"                   TIMESTAMP,

    FOREIGN KEY ("specialist_id") REFERENCES specialists("id"),
    FOREIGN KEY ("billing_period_id") REFERENCES billing_periods("id")
);

CREATE TABLE IF NOT EXISTS invoice_items (
    "id"                        UUID      PRIMARY KEY  NOT NULL,
    "invoice_id"                UUID                   NOT NULL,

    "type"                      INT                    NOT NULL, -- REVENUE, COST
    "source_type"               VARCHAR(40)            NOT NULL, -- APPOINTMENT, FIXED_COST, OTHER

    "description"               VARCHAR(255)           NOT NULL,

    "quantity"                  INT                    NOT NULL,
    "unit_amount"               INT                    NOT NULL, -- in cents

    "gross_amount"              INT                    NOT NULL, -- in cents
    "discount_amount"           INT                    NOT NULL, -- in cents
    "tax_amount"                INT                    NOT NULL, -- in cents
    "net_amount"                INT                    NOT NULL -- in cents   
);

---- create above / drop below ----

DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS billing_periods;