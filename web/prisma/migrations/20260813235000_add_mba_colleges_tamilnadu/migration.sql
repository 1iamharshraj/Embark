-- Create the MbaCollege table
CREATE TABLE "MbaCollege" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "affiliation" TEXT,
    "accreditation" TEXT,
    "establishedYear" INTEGER,
    "campusType" TEXT,
    "feesMin" INTEGER,
    "feesMax" INTEGER,
    "avgPackage" INTEGER,
    "highestPackage" INTEGER,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entranceExams" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rankState" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MbaCollege_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "MbaCollege_state_idx" ON "MbaCollege"("state");
CREATE INDEX "MbaCollege_city_idx" ON "MbaCollege"("city");
CREATE INDEX "MbaCollege_specializations_idx" ON "MbaCollege" USING GIN ("specializations");

-- Sample Tamil Nadu MBA colleges
INSERT INTO "MbaCollege" ("id", "name", "shortName", "city", "state", "affiliation", "accreditation", "establishedYear", "campusType", "feesMin", "feesMax", "avgPackage", "highestPackage", "specializations", "entranceExams", "facilities", "website", "phone", "email", "address", "isActive", "rankState", "createdAt", "updatedAt") VALUES
  ('cm001mba0001', 'Indian Institute of Management Tiruchirappalli', 'IIM Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'Autonomous / Govt', 'AACSB, AMBA', 2011, 'Urban', 1900000, 2200000, 1700000, 2800000, ARRAY['Finance','Marketing','Operations','HR','Business Analytics'], ARRAY['CAT','GMAT'], ARRAY['Hostel','Wi-Fi','Library','Sports','Incubation Centre'], 'https://www.iimtrichy.ac.in', '0431-280-4000', 'admissions@iimtrichy.ac.in', 'Pirattiyur, Tiruchirappalli', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0002', 'Department of Management Studies, IIT Madras', 'DoMS IIT Madras', 'Chennai', 'Tamil Nadu', 'IIT Madras', 'NAAC A++', 1979, 'Urban', 900000, 1200000, 1800000, 3200000, ARRAY['Finance','Marketing','Operations','Systems','General Management'], ARRAY['CAT','GATE'], ARRAY['Hostel','Library','Research Labs','Sports'], 'https://doms.iitm.ac.in', '044-2257-4600', 'doms@iitm.ac.in', 'IIT Madras, Chennai', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0003', 'Loyola Institute of Business Administration', 'LIBA', 'Chennai', 'Tamil Nadu', 'Loyola College', 'NAAC A++', 1979, 'Urban', 900000, 1100000, 900000, 1800000, ARRAY['Finance','Marketing','HR','Operations'], ARRAY['CAT','XAT'], ARRAY['Hostel','Library','Auditorium','Cafeteria'], 'https://www.liba.ac.in', '044-2817-7000', 'admissions@liba.edu', 'Nungambakkam, Chennai', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0004', 'Great Lakes Institute of Management', 'Great Lakes', 'Chennai', 'Tamil Nadu', 'Autonomous', 'NBA, AACSB', 2004, 'Urban', 1700000, 2100000, 1500000, 2400000, ARRAY['Finance','Marketing','Operations','Business Analytics','HR'], ARRAY['CAT','XAT','CMAT','GMAT'], ARRAY['Hostel','Wi-Fi','Library','Sports','Analytics Lab'], 'https://www.greatlakes.edu.in', '044-3050-9500', 'admissions@greatlakes.edu.in', 'Manamai, Chennai', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0005', 'Madras Christian College', 'MCC', 'Chennai', 'Tamil Nadu', 'University of Madras', 'NAAC A++', 1837, 'Urban', 200000, 350000, 650000, 1200000, ARRAY['Finance','Marketing','HR','Operations'], ARRAY['TANCET','MAT'], ARRAY['Hostel','Library','Sports','Canteen'], 'https://www.mcc.edu.in', '044-2239-6300', 'mba@mcc.edu.in', 'Tambaram, Chennai', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0006', 'Bharathidasan Institute of Management', 'BIM', 'Tiruchirappalli', 'Tamil Nadu', 'Bharathidasan University', 'NBA, NAAC A', 1984, 'Urban', 600000, 800000, 850000, 1600000, ARRAY['Finance','Marketing','Operations','HR'], ARRAY['CAT','XAT','CMAT','MAT'], ARRAY['Hostel','Library','Sports','Computer Lab'], 'https://www.bim.edu', '0431-270-1000', 'admissions@bim.edu', 'Mangalam, Tiruchirappalli', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0007', 'PSG Institute of Management', 'PSGIM', 'Coimbatore', 'Tamil Nadu', 'PSG College of Technology', 'NBA, NAAC A', 1994, 'Urban', 500000, 700000, 800000, 1400000, ARRAY['Finance','Marketing','Operations','HR','Business Analytics'], ARRAY['CAT','MAT','XAT'], ARRAY['Hostel','Library','Sports','Incubation Centre'], 'https://www.psgim.ac.in', '0422-257-5000', 'admissions@psgim.ac.in', 'Peelamedu, Coimbatore', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0008', 'SRM Institute of Science and Technology', 'SRM IST', 'Chennai', 'Tamil Nadu', 'Deemed University', 'NAAC A++', 1985, 'Urban', 400000, 700000, 750000, 1300000, ARRAY['Finance','Marketing','HR','Operations','Business Analytics'], ARRAY['CAT','MAT','XAT','CMAT'], ARRAY['Hostel','Wi-Fi','Library','Sports','Hospital'], 'https://www.srmist.edu.in', '044-2741-7400', 'admissions@srmist.edu.in', 'Kattankulathur, Chennai', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0009', 'SSN School of Management', 'SSN SoM', 'Chennai', 'Tamil Nadu', 'SSN Institutions', 'NBA', 1996, 'Urban', 600000, 900000, 900000, 1500000, ARRAY['Finance','Marketing','HR','Operations'], ARRAY['CAT','XAT','MAT'], ARRAY['Hostel','Library','Sports','Innovation Lab'], 'https://www.ssn.edu.in', '044-2746-9700', 'admissions@ssn.edu.in', 'Kalavakkam, Chennai', true, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0010', 'Thiagarajar School of Management', 'TSM', 'Madurai', 'Tamil Nadu', 'Thiagarajar College', 'NBA, NAAC A', 1992, 'Urban', 500000, 700000, 700000, 1200000, ARRAY['Finance','Marketing','HR','Operations','Business Analytics'], ARRAY['CAT','MAT','XAT'], ARRAY['Hostel','Library','Sports','Wi-Fi'], 'https://www.tsm.ac.in', '0452-248-2220', 'admissions@tsm.ac.in', 'Thirupparankundram, Madurai', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0011', 'Kumaraguru College of Technology', 'KCT', 'Coimbatore', 'Tamil Nadu', 'Anna University', 'NAAC A', 1984, 'Urban', 250000, 400000, 550000, 900000, ARRAY['Finance','Marketing','HR','Operations'], ARRAY['TANCET','MAT'], ARRAY['Hostel','Library','Sports','Canteen'], 'https://www.kct.ac.in', '0422-236-0100', 'mba@kct.ac.in', 'Coimbatore', true, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0012', 'Sri Krishna College of Engineering and Technology', 'SKCET', 'Coimbatore', 'Tamil Nadu', 'Anna University', 'NAAC A', 2001, 'Urban', 200000, 350000, 500000, 850000, ARRAY['Finance','Marketing','HR'], ARRAY['TANCET','MAT'], ARRAY['Hostel','Library','Sports','Cafeteria'], 'https://www.skcet.ac.in', '0422-298-5000', 'mba@skcet.ac.in', 'Kuniyamuthur, Coimbatore', true, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0013', 'NIT Trichy Department of Management Studies', 'NIT Trichy MBA', 'Tiruchirappalli', 'Tamil Nadu', 'NIT Trichy', 'NBA', 2006, 'Urban', 300000, 500000, 950000, 1600000, ARRAY['Finance','Marketing','Operations','HR'], ARRAY['CAT'], ARRAY['Hostel','Library','Sports','Incubation Centre'], 'https://www.nitt.edu', '0431-250-3000', 'mba@nitt.edu', 'Tiruchirappalli', true, 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0014', 'Rajalakshmi Engineering College', 'REC', 'Chennai', 'Tamil Nadu', 'Anna University', 'NAAC A', 1997, 'Urban', 180000, 300000, 500000, 800000, ARRAY['Finance','Marketing','HR','Operations'], ARRAY['TANCET','MAT'], ARRAY['Hostel','Library','Sports','Canteen'], 'https://www.rajalakshmi.org', '044-3717-1111', 'mba@rajalakshmi.edu.in', 'Thandalam, Chennai', true, 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cm001mba0015', 'VIT Business School', 'VIT Vellore', 'Vellore', 'Tamil Nadu', 'VIT University', 'NAAC A++', 1994, 'Urban', 600000, 900000, 850000, 1500000, ARRAY['Finance','Marketing','HR','Operations','Business Analytics'], ARRAY['CAT','XAT','MAT','NMAT'], ARRAY['Hostel','Wi-Fi','Library','Sports','Hospital'], 'https://vit.ac.in', '0416-224-3091', 'admissions@vit.ac.in', 'Katpadi, Vellore', true, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
