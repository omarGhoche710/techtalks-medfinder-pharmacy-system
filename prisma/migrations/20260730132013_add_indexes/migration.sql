-- CreateIndex
CREATE INDEX "invitations_pharmacy_id_idx" ON "invitations"("pharmacy_id");

-- CreateIndex
CREATE INDEX "invitations_invited_email_idx" ON "invitations"("invited_email");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "invitations_expires_at_idx" ON "invitations"("expires_at");

-- CreateIndex
CREATE INDEX "medications_pharmacy_id_idx" ON "medications"("pharmacy_id");

-- CreateIndex
CREATE INDEX "medications_name_idx" ON "medications"("name");

-- CreateIndex
CREATE INDEX "medications_status_idx" ON "medications"("status");

-- CreateIndex
CREATE INDEX "medications_date_expired_idx" ON "medications"("date_expired");

-- CreateIndex
CREATE INDEX "medications_is_transferable_idx" ON "medications"("is_transferable");

-- CreateIndex
CREATE INDEX "pharmacies_lat_lng_idx" ON "pharmacies"("lat", "lng");

-- CreateIndex
CREATE INDEX "pharmacy_memberships_pharmacy_id_idx" ON "pharmacy_memberships"("pharmacy_id");

-- CreateIndex
CREATE INDEX "pharmacy_memberships_is_active_idx" ON "pharmacy_memberships"("is_active");
