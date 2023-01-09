CREATE TABLE "public"."transactions" (
    "id" integer DEFAULT nextval('transactions_id_seq') NOT NULL,
    "name" text NOT NULL,
    "symbol" text NOT NULL,
    "type" text,
    "value_usd" double precision NOT NULL,
    "purchased_price" double precision NOT NULL,
    "date" timestamp NOT NULL,
    "coins" double precision NOT NULL,
    "status" text DEFAULT 'active' NOT NULL
) WITH (oids = false);