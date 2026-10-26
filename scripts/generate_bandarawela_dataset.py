#!/usr/bin/env python3
"""
ASVANNA Bandarawela Cultivation Dataset Generator
Generates realistic farmer profiles, past harvests, and current active plantings.
Outputs:
  - Test_data/bandarawela_farmer_cultivation_dataset.json
  - Test_data/bandarawela_farmer_cultivation_dataset.csv
"""

import json
import csv
import os
from datetime import datetime, timedelta

# GN Division Coordinates in Bandarawela
GN_COORDS = {
    'Bandarawela Central': (6.8270, 80.9980),
    'Bindunuwewa': (6.8390, 80.9910),
    'Kinigama': (6.8150, 81.0120),
    'Heeloya': (6.8450, 81.0250),
    'Halpe': (6.7820, 80.9850),
    'Welimada Road': (6.8520, 80.9820),
    'Diyatalawa Road': (6.8180, 80.9700),
    'Haputale Road': (6.7950, 80.9650),
    'Kahatathawela': (6.8320, 81.0150),
    'Mirahawatte': (6.8650, 80.9750)
}

FARMER_DEFINITIONS = [
    ("Sunil Bandara", "0771000001", "19850010000", "Bandarawela Central", 240),
    ("Chaminda Silva", "0771000002", "19850020137", "Bindunuwewa", 160),
    ("Anura Jayawardena", "0771000003", "19850030274", "Kinigama", 320),
    ("Kithsiri Wickramasinghe", "0771000004", "19850040411", "Heeloya", 240),
    ("Nimal Weerasinghe", "0771000005", "19850050548", "Halpe", 160),
    ("Priyantha Dissanayake", "0771000006", "19850060685", "Welimada Road", 400),
    ("Ranjith Gunasekara", "0771000007", "19850070822", "Diyatalawa Road", 160),
    ("Sarath Kumara", "0771000008", "19850080959", "Haputale Road", 160),
    ("Gamini Senanayake", "0771000009", "19850091096", "Kahatathawela", 320),
    ("Lalith Wijesinghe", "0771000010", "19850101233", "Mirahawatte", 240),
    ("Upul Rathnayake", "0771000011", "19850111370", "Bandarawela Central", 160),
    ("Mahinda Rajapaksha", "0771000012", "19850121507", "Bindunuwewa", 480),
    ("Rohana Karunaratne", "0771000013", "19850131644", "Kinigama", 160),
    ("Samantha Perera", "0771000014", "19850141781", "Heeloya", 320),
    ("Bandula Fernando", "0771000015", "19850151918", "Halpe", 240),
    ("Jagath Jayasuriya", "0771000016", "19850162055", "Welimada Road", 320),
    ("Nihal Abeywickrama", "0771000017", "19850172192", "Diyatalawa Road", 160),
    ("Ruwan Wickramaratne", "0771000018", "19850182329", "Haputale Road", 160),
    ("Sisira Senaratne", "0771000019", "19850192466", "Kahatathawela", 320),
    ("Ajith Premadasa", "0771000020", "19850202603", "Mirahawatte", 240),
    ("Chandana Alahakoon", "0771000021", "19850212740", "Bandarawela Central", 240),
    ("Dhammika Ranasinghe", "0771000022", "19850222877", "Bindunuwewa", 160),
    ("Indika Samarakoon", "0771000023", "19850233014", "Kinigama", 320),
    ("Jayantha Tennakoon", "0771000024", "19850243151", "Heeloya", 160),
    ("Kamal Jayasinghe", "0771000025", "19850253288", "Halpe", 400),
    ("Lasantha Kulatunga", "0771000026", "78255275V", "Welimada Road", 160),
    ("Manjula Pathirana", "0771000027", "78265486V", "Diyatalawa Road", 240),
    ("Nuwan Ekanayake", "0771000028", "78275697V", "Haputale Road", 160),
    ("Prasanna Herath", "0771000029", "78285908V", "Kahatathawela", 240),
    ("Roshan Madugalle", "0771000030", "78296119V", "Mirahawatte", 320),
    ("Sanath Attanayake", "0771000031", "78306330V", "Bandarawela Central", 240),
    ("Thushara Wanninayake", "0771000032", "78316541V", "Bindunuwewa", 160),
    ("Wasantha Seneviratne", "0771000033", "78326752V", "Kinigama", 400),
    ("Asela Liyanage", "0771000034", "78336963V", "Heeloya", 160),
    ("Chathura Samarasinghe", "0771000035", "78347174V", "Halpe", 240),
    ("Dinesh Hettiarachchi", "0771000036", "78357385V", "Welimada Road", 240),
    ("Gayan Wickramasooriya", "0771000037", "78367596V", "Diyatalawa Road", 160),
    ("Harsha Bogahawatta", "0771000038", "78377807V", "Haputale Road", 320),
    ("Janaka Wijewardena", "0771000039", "78388018V", "Kahatathawela", 160),
    ("Kasun Jayalath", "0771000040", "78398229V", "Mirahawatte", 480),
    ("Lakshman Dassanayake", "0771000041", "78408440V", "Bandarawela Central", 240),
    ("Malinda Karunanayake", "0771000042", "78418651V", "Bindunuwewa", 160),
    ("Nadeeka Basnayake", "0771000043", "78428862V", "Kinigama", 320),
    ("Pradeep Gunawardena", "0771000044", "78439073V", "Heeloya", 160),
    ("Ravindra Jayakody", "0771000045", "78449284V", "Halpe", 240),
    ("Sandun Weerakkody", "0771000046", "78459495V", "Welimada Road", 240),
    ("Tharaka Mediwake", "0771000047", "78469706V", "Diyatalawa Road", 320),
    ("Udaya Ratwatte", "0771000048", "78479917V", "Haputale Road", 160),
    ("Viraj Siriwardena", "0771000049", "78480128V", "Kahatathawela", 400),
    ("Yohan Samarasekera", "0771000050", "78490339V", "Mirahawatte", 240)
]

# 11 Master Crops with Yield and Quota metadata
CROPS_META = {
    1: {"code": "LEEKS", "name_en": "Leeks", "name_si": "ලීක්ස්", "yield_per_acre": 8500, "quota": 95000, "duration": 90, "price": 280.00},
    2: {"code": "CABBAGE", "name_en": "Cabbage", "name_si": "ගෝවා", "yield_per_acre": 12000, "quota": 120000, "duration": 75, "price": 190.00},
    3: {"code": "CARROT", "name_en": "Carrot", "name_si": "කැරට්", "yield_per_acre": 7500, "quota": 110000, "duration": 85, "price": 340.00},
    4: {"code": "BEETROOT", "name_en": "Beetroot", "name_si": "බීට්රූට්", "yield_per_acre": 8000, "quota": 75000, "duration": 70, "price": 260.00},
    5: {"code": "POTATO", "name_en": "Upcountry Potato (Welimada)", "name_si": "අර්තාපල්", "yield_per_acre": 8000, "quota": 150000, "duration": 100, "price": 390.00},
    6: {"code": "BEANS", "name_en": "Green Beans (Butter/Bush)", "name_si": "බෝංචි", "yield_per_acre": 5000, "quota": 80000, "duration": 60, "price": 320.00},
    7: {"code": "TOMATO", "name_en": "Tomato", "name_si": "තක්කාලි", "yield_per_acre": 11000, "quota": 115000, "duration": 75, "price": 220.00},
    8: {"code": "CAPSICUM", "name_en": "Capsicum (Bell Pepper)", "name_si": "මාළු මිරිස්", "yield_per_acre": 5500, "quota": 65000, "duration": 80, "price": 460.00},
    9: {"code": "RADISH", "name_en": "Radish", "name_si": "රාබු", "yield_per_acre": 9000, "quota": 50000, "duration": 45, "price": 140.00},
    10: {"code": "KNOLKHOL", "name_en": "Knol-Khol (Kohlrabi)", "name_si": "නෝල්කෝල්", "yield_per_acre": 7500, "quota": 45000, "duration": 65, "price": 180.00},
    15: {"code": "CAULIFLOWER", "name_en": "Cauliflower", "name_si": "මල්ගෝවා", "yield_per_acre": 6500, "quota": 40000, "duration": 80, "price": 380.00}
}

# Target Active Cultivation Distribution to generate realistic market saturation
# Designed around Bandarawela Agrarian Division:
# Carrot: Overplanted (92% saturation -> GLUT WARNING)
# Leeks: High saturation (78.7% -> WARNING)
# Cabbage: Moderate (65%)
# Potato: Welimada belt prime (56%)
# Beetroot: Moderate (51.2%)
# Tomato: Healthy (30.6%)
# Cauliflower: Undersupplied (29.2% -> High Market Gap)
# Knolkhol: High market gap (25.0%)
# Beans: High market gap (21.9%)
# Radish: Fast turnaround, under-supplied (21.6%)
# Capsicum: High market gap (18.6%)

ACTIVE_PLANS_BY_CROP = [
    # (CropID, List of plot acres) -> Target total acres
    (3, [1.25, 1.0, 1.5, 1.25, 1.0, 1.5, 1.0, 1.25, 1.0, 1.25, 0.75, 0.75]), # Carrot: 13.5 ac -> 101,250 kg (92.0% saturation)
    (1, [1.0, 1.25, 1.0, 1.25, 1.0, 1.25, 1.0, 1.05]),                      # Leeks: 8.8 ac -> 74,800 kg (78.7% saturation)
    (2, [1.0, 1.25, 1.0, 1.0, 1.25, 1.0]),                                  # Cabbage: 6.5 ac -> 78,000 kg (65.0% saturation)
    (5, [1.5, 1.25, 1.25, 1.0, 1.5, 1.0, 1.0, 1.0, 1.0]),                  # Potato: 10.5 ac -> 84,000 kg (56.0% saturation)
    (4, [1.0, 1.0, 1.0, 1.0, 0.8]),                                         # Beetroot: 4.8 ac -> 38,400 kg (51.2% saturation)
    (7, [0.8, 1.0, 0.7, 0.7]),                                              # Tomato: 3.2 ac -> 35,200 kg (30.6% saturation)
    (15, [0.6, 0.6, 0.6]),                                                   # Cauliflower: 1.8 ac -> 11,700 kg (29.2% saturation)
    (10, [0.5, 0.5, 0.5]),                                                   # Knolkhol: 1.5 ac -> 11,250 kg (25.0% saturation)
    (6, [0.75, 0.75, 0.75, 0.75, 0.5]),                                     # Beans: 3.5 ac -> 17,500 kg (21.9% saturation)
    (9, [0.6, 0.6]),                                                         # Radish: 1.2 ac -> 10,800 kg (21.6% saturation)
    (8, [0.75, 0.75, 0.7])                                                   # Capsicum: 2.2 ac -> 12,100 kg (18.6% saturation)
]

def main():
    print("🌾 Starting Bandarawela Cultivation Dataset generation...")

    # 1. Build Farmers
    farmers = []
    farmer_id_start = 101
    for idx, (name, phone, nic, gnd, perches) in enumerate(FARMER_DEFINITIONS):
        fid = farmer_id_start + idx
        lat_base, lng_base = GN_COORDS[gnd]
        # Slight jitter for realistic GPS
        lat = round(lat_base + (idx % 7) * 0.0007, 6)
        lng = round(lng_base + (idx % 5) * 0.0006, 6)
        acres = round(perches / 160.0, 4)

        farmers.append({
            "farmer_id": fid,
            "full_name": name,
            "phone": phone,
            "nic": nic,
            "district": "Badulla",
            "division": "Bandarawela",
            "gn_division": gnd,
            "total_land_perches": perches,
            "total_land_acres": acres,
            "latitude": lat,
            "longitude": lng,
            "verification_status": "APPROVED",
            "role": "FARMER"
        })

    print(f"✅ Created {len(farmers)} Farmer Profiles.")

    # 2. Build Active Plantings (status: 'GROWING' or 'PLANTED')
    active_plantings = []
    planting_id_start = 1001
    pid = planting_id_start

    today = datetime(2026, 10, 26)

    # Assign active plots to farmers
    farmer_idx = 0
    for crop_id, plot_extents in ACTIVE_PLANS_BY_CROP:
        cm = CROPS_META[crop_id]
        for plot_acres in plot_extents:
            farmer = farmers[farmer_idx % len(farmers)]
            farmer_idx += 1

            # Planting date in September or October 2026
            days_ago = 5 + (pid % 38)
            p_date = today - timedelta(days=days_ago)
            h_date = p_date + timedelta(days=cm["duration"])

            status = "PLANTED" if days_ago <= 10 else "GROWING"
            expected_yield = round(plot_acres * cm["yield_per_acre"], 2)
            perches = round(plot_acres * 160, 1)

            active_plantings.append({
                "id": pid,
                "farmer_id": farmer["farmer_id"],
                "farmer_name": farmer["full_name"],
                "crop_id": crop_id,
                "crop_code": cm["code"],
                "crop_name_en": cm["name_en"],
                "crop_name_si": cm["name_si"],
                "land_size_acres": plot_acres,
                "land_size_perches": perches,
                "expected_yield_kg": expected_yield,
                "planting_date": p_date.strftime("%Y-%m-%d"),
                "expected_harvest_date": h_date.strftime("%Y-%m-%d"),
                "status": status,
                "gn_division": farmer["gn_division"],
                "district": "Badulla",
                "division": "Bandarawela",
                "latitude": farmer["latitude"],
                "longitude": farmer["longitude"]
            })
            pid += 1

    print(f"✅ Generated {len(active_plantings)} Current Active Planting Records.")

    # 3. Build Historical Harvested Records (Past May-August 2026 Season)
    # Demonstrating crop rotation experience and past track record
    past_plantings = []
    # Rotate each farmer with a past crop different from their current crop
    past_crops = [
        (5, 1.25), (6, 0.75), (2, 1.0), (1, 1.0), (4, 0.8),
        (3, 1.0), (9, 0.6), (10, 0.5), (15, 0.6), (7, 0.8)
    ]

    for i in range(45):
        farmer = farmers[i]
        crop_id, plot_acres = past_crops[i % len(past_crops)]
        cm = CROPS_META[crop_id]

        # Planted 110-150 days ago, harvested 30-60 days ago
        days_planted_ago = 110 + (i * 2) % 40
        p_date = today - timedelta(days=days_planted_ago)
        h_date = p_date + timedelta(days=cm["duration"])

        expected_yield = round(plot_acres * cm["yield_per_acre"], 2)
        # Real-world variance in actual harvest: 92% to 105% of expected
        variance = 0.92 + ((i * 7) % 14) / 100.0
        actual_yield = round(expected_yield * variance, 2)
        perches = round(plot_acres * 160, 1)

        past_plantings.append({
            "id": pid,
            "farmer_id": farmer["farmer_id"],
            "farmer_name": farmer["full_name"],
            "crop_id": crop_id,
            "crop_code": cm["code"],
            "crop_name_en": cm["name_en"],
            "crop_name_si": cm["name_si"],
            "land_size_acres": plot_acres,
            "land_size_perches": perches,
            "expected_yield_kg": expected_yield,
            "actual_yield_kg": actual_yield,
            "planting_date": p_date.strftime("%Y-%m-%d"),
            "expected_harvest_date": h_date.strftime("%Y-%m-%d"),
            "harvested_date": h_date.strftime("%Y-%m-%d"),
            "status": "HARVESTED",
            "gn_division": farmer["gn_division"],
            "district": "Badulla",
            "division": "Bandarawela",
            "latitude": farmer["latitude"],
            "longitude": farmer["longitude"]
        })
        pid += 1

    print(f"✅ Generated {len(past_plantings)} Historical Harvest Records.")

    # 4. Compute Saturation, Market Gap, and Recommendation Scores
    saturation_summary = []
    for crop_id in sorted(CROPS_META.keys()):
        cm = CROPS_META[crop_id]
        active_plots = [p for p in active_plantings if p["crop_id"] == crop_id]
        total_acres = round(sum(p["land_size_acres"] for p in active_plots), 2)
        expected_supply = round(sum(p["expected_yield_kg"] for p in active_plots), 2)
        quota = cm["quota"]

        ratio = (expected_supply / quota) * 100.0 if quota > 0 else 0
        market_gap_kg = max(0, quota - expected_supply)

        # Over-planting Score algorithm matching riskEngineService.js
        if ratio < 50:
            overplant_score = round(ratio * 0.4)
        elif ratio <= 75:
            overplant_score = round(20 + ((ratio - 50) * 1.2))
        elif ratio <= 100:
            overplant_score = round(50 + ((ratio - 75) * 1.6))
        else:
            overplant_score = 100

        # Market Gap Score matching recommendationService.js
        market_gap_score = max(0, min(100, 100 - overplant_score))

        # Risk Level
        risk_level = "SAFE"
        if overplant_score >= 70:
            risk_level = "OVER_PLANTED"
        elif overplant_score >= 40:
            risk_level = "WARNING"

        saturation_summary.append({
            "crop_id": crop_id,
            "crop_code": cm["code"],
            "name_en": cm["name_en"],
            "name_si": cm["name_si"],
            "plots_count": len(active_plots),
            "total_planted_acres": total_acres,
            "expected_supply_kg": expected_supply,
            "regional_quota_kg": quota,
            "market_gap_kg": market_gap_kg,
            "saturation_percentage": round(ratio, 1),
            "over_planting_score": overplant_score,
            "market_gap_score": market_gap_score,
            "risk_level": risk_level,
            "growth_duration_days": cm["duration"],
            "wholesale_price_rs": cm["price"]
        })

    # 5. Export JSON
    output_json = {
        "metadata": {
            "title": "ASVANNA Bandarawela Cultivation Dataset for Recommendation Engine Validation",
            "region": "Bandarawela Agrarian Division, Badulla District",
            "generated_at": datetime.now().isoformat(),
            "farmers_count": len(farmers),
            "active_plantings_count": len(active_plantings),
            "past_harvests_count": len(past_plantings),
            "total_plantings_count": len(active_plantings) + len(past_plantings)
        },
        "crops_saturation_and_market_gap_analysis": saturation_summary,
        "farmers": farmers,
        "active_plantings": active_plantings,
        "past_plantings": past_plantings
    }

    json_path = os.path.join("Test_data", "bandarawela_farmer_cultivation_dataset.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output_json, f, indent=2, ensure_ascii=False)
    print(f"📁 JSON File saved: {json_path}")

    # 6. Export Flat CSV for Spreadsheet Review
    csv_path = os.path.join("Test_data", "bandarawela_farmer_cultivation_dataset.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Record_Type", "Record_ID", "Farmer_ID", "Farmer_Name", "Phone", "NIC",
            "GN_Division", "District", "Division", "Crop_ID", "Crop_Code", "Crop_Name_EN",
            "Crop_Name_SI", "Land_Size_Perches", "Land_Size_Acres", "Expected_Yield_KG",
            "Actual_Yield_KG", "Planting_Date", "Expected_Harvest_Date", "Harvested_Date", "Status"
        ])

        # Write active records
        for p in active_plantings:
            f_match = next((fm for fm in farmers if fm["farmer_id"] == p["farmer_id"]), {})
            writer.writerow([
                "ACTIVE_PLANTING", p["id"], p["farmer_id"], p["farmer_name"],
                f_match.get("phone", ""), f_match.get("nic", ""), p["gn_division"],
                p["district"], p["division"], p["crop_id"], p["crop_code"],
                p["crop_name_en"], p["crop_name_si"], p["land_size_perches"],
                p["land_size_acres"], p["expected_yield_kg"], "",
                p["planting_date"], p["expected_harvest_date"], "", p["status"]
            ])

        # Write historical records
        for p in past_plantings:
            f_match = next((fm for fm in farmers if fm["farmer_id"] == p["farmer_id"]), {})
            writer.writerow([
                "PAST_HARVEST", p["id"], p["farmer_id"], p["farmer_name"],
                f_match.get("phone", ""), f_match.get("nic", ""), p["gn_division"],
                p["district"], p["division"], p["crop_id"], p["crop_code"],
                p["crop_name_en"], p["crop_name_si"], p["land_size_perches"],
                p["land_size_acres"], p["expected_yield_kg"], p["actual_yield_kg"],
                p["planting_date"], p["expected_harvest_date"], p["harvested_date"], p["status"]
            ])

    print(f"📁 CSV File saved: {csv_path}")

    # Print summary table
    print("\n" + "=" * 90)
    print(f"{'Crop':<12} | {'Acres':<6} | {'Supply(kg)':<10} | {'Quota(kg)':<10} | {'Sat %':<6} | {'OverPl':<6} | {'MktGap':<6} | {'Risk':<12}")
    print("-" * 90)
    for s in saturation_summary:
        print(f"{s['crop_code']:<12} | {s['total_planted_acres']:<6} | {s['expected_supply_kg']:<10} | {s['regional_quota_kg']:<10} | {s['saturation_percentage']:<6}% | {s['over_planting_score']:<6} | {s['market_gap_score']:<6} | {s['risk_level']:<12}")
    print("=" * 90)

if __name__ == "__main__":
    main()
