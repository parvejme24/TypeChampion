-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "paragraphId" INTEGER,
ADD COLUMN     "paragraphText" TEXT,
ADD COLUMN     "paragraphTitle" TEXT,
ADD COLUMN     "typedText" TEXT;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "Paragraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;
