-- CreateTable
CREATE TABLE "model_detections" (
    "id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "violations" TEXT NOT NULL,
    "snapshot_url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_detections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "model_detections_status_idx" ON "model_detections"("status");
