import os
import re
import sys
from sqlalchemy import func, text

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(CURRENT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from database import SessionLocal
from models.court import Court


def normalize_text(value: str) -> str:
    if not value:
        return value
    cleaned = value.replace("–", "-").replace("—", "-")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def build_courts():
    courts = []

    def add(region, court_type, names):
        for name in names:
            courts.append({
                "region": region,
                "court_type": court_type,
                "name": normalize_text(name),
            })

    add("Western Region", "Court of Appeal", [
        "Court of Appeal, Sekondi",
    ])
    add("Western Region", "High Court", [
        "Tarkwa High Court",
        "Sekondi High Court - 1",
        "Sekondi High Court - 2",
        "Sekondi High Court - 3",
        "Sekondi Commercial Court - A",
        "Sekondi Commercial Court - B",
    ])
    add("Western Region", "Circuit Court", [
        "Takoradi Circuit Court - A",
        "Takoradi Circuit Court - B",
        "Sekondi Circuit Court (Gender Based Violence Court)",
        "Tarkwa Circuit Court (GBVC)",
        "Axim Circuit Court",
    ])
    add("Western Region", "District Court", [
        "Sekondi District Court - A",
        "Sekondi District Court - B",
        "Takoradi Harbour Area District Court",
        "Takoradi Market Circle District Court",
        "Tarkwa District Court - A",
        "Tarkwa District Court - B",
        "Half Assini District Court",
        "Prestea District Court",
        "Agona Nkwanta District Court",
        "Shama District Court",
        "Asankrangwa District Court",
        "Wassa Akropong District Court",
        "Nkroful District Court",
        "Daboase District Court",
        "Effia Kwesimintsim District Court",
        "Mpohor District Court",
    ])

    add("Western North Region", "High Court", [
        "Sefwi Wiawso High Court",
    ])
    add("Western North Region", "Circuit Court", [
        "Bibiani Circuit Court (GBVC)",
        "Bodi Circuit Court",
        "Enchi Circuit Court",
    ])
    add("Western North Region", "District Court", [
        "Bibiani District Court",
        "Enchi District Court",
        "Sefwi Juaboso District Court",
        "Sefwi Wiawso District Court",
        "Sefwi Debiso District Court",
        "Sefwi Akontombra District Court",
        "Adabokrom District Court",
    ])

    add("Central Region", "High Court", [
        "Cape Coast High Court - 1",
        "Cape Coast High Court - 2",
        "Cape Coast High Court - 3",
        "Commercial Court - A",
        "Commercial Court - B",
        "Agona Swedru High Court",
        "Winneba High Court",
        "Dunkwa on Offin High Court",
        "Mankesim High Court",
        "Assin Fosu High Court",
        "Kasoa Odupong Kpehe High Court - 1",
        "Kasoa Odupong Kpehe High Court - 2",
        "Gyegyenadze (Winneba) High Court",
    ])
    add("Central Region", "Circuit Court", [
        "Cape Coast Circuit Court - 1 (GBVC)",
        "Cape Coast Circuit Court - 2",
        "Agona Swedru Circuit Court",
        "Dunkwa on Offin Circuit Court",
        "Kasoa Ofaakor Circuit Court",
        "Mankesim Circuit Court",
        "Kyekyewere Nsuaem Circuit Court",
        "Gyegyenadze (Winneba) Circuit Court",
    ])
    add("Central Region", "District Court", [
        "Cape Coast District Court - 1",
        "Cape Coast District Court - 2",
        "Awutu District Court",
        "Breman Asikuma District Court",
        "Ajumako District Court",
        "Dunkwa on Offin District Court",
        "Elmina District Court",
        "Essakyir District Court",
        "Saltpond District Court",
        "Twifo Praso District Court",
        "Winneba District Court",
        "Abura Dunkwa District Court",
        "Agona Swedru District Court",
        "Apam District Court",
        "Assin Fosu District Court",
        "Dawurapong District Court",
        "Nyankumasi Ahenkro District Court",
        "Kasoa Akweley District Court",
        "Kasoa Ofaakor District Court",
        "Diaso District Court",
        "Mankesim District Court",
        "Gomoa Afransi District Court",
        "Agona Nsabaa District Court",
        "Twifo Heman District Court",
    ])

    add("Greater Accra Region", "Supreme Court", [
        "Supreme Court, Accra",
    ])
    add("Greater Accra Region", "Court of Appeal", [
        "Appeal Court, Accra - Civil Division",
        "Appeal Court, Accra - Criminal Division",
    ])
    add("Greater Accra Region", "High Court", [
        "Accra High Court - General Jurisdiction - 1",
        "Accra High Court - General Jurisdiction - 2",
        "Accra High Court - General Jurisdiction - 3",
        "Accra High Court - General Jurisdiction - 4",
        "Accra High Court - General Jurisdiction - 5",
        "Accra High Court - General Jurisdiction - 6",
        "Accra High Court - General Jurisdiction - 7",
        "Accra High Court - General Jurisdiction - 8",
        "Accra High Court - General Jurisdiction - 9",
        "Accra High Court - General Jurisdiction - 10",
        "Accra High Court - General Jurisdiction - 11",
        "Accra High Court - General Jurisdiction - 12",
        "Accra High Court - General Jurisdiction - 13",
        "Accra High Court - General Jurisdiction - 14",
        "Accra High Court - Land Court - 1",
        "Accra High Court - Land Court - 2",
        "Accra High Court - Land Court - 3",
        "Accra High Court - Land Court - 4",
        "Accra High Court - Land Court - 5",
        "Accra High Court - Land Court - 6",
        "Accra High Court - Land Court - 7",
        "Accra High Court - Land Court - 8",
        "Accra High Court - Land Court - 9",
        "Accra High Court - Land Court - 10",
        "Accra High Court - Land Court - 11",
        "Accra High Court - Labour Court - 1",
        "Accra High Court - Labour Court - 2",
        "Accra High Court - Commercial Court - 1",
        "Accra High Court - Commercial Court - 2",
        "Accra High Court - Commercial Court - 3",
        "Accra High Court - Commercial Court - 4",
        "Accra High Court - Commercial Court - 5",
        "Accra High Court - Commercial Court - 6",
        "Accra High Court - Commercial Court - 7",
        "Accra High Court - Commercial Court - 8",
        "Accra High Court - Commercial Court - 9",
        "Accra High Court - Commercial Court - 10",
        "Accra High Court - Family Court - 1",
        "Accra High Court - Family Court - 2",
        "Accra High Court - Family Court - 3",
        "Accra High Court - Criminal Court - 1",
        "Accra High Court - Criminal Court - 2",
        "Accra High Court - Criminal Court - 3",
        "Accra High Court - Criminal Court - 4",
        "Accra High Court - Criminal Court - 5",
        "Accra High Court - Probate & L.A. Court - 1",
        "Accra High Court - Probate & L.A. Court - 2",
        "Accra High Court - Probate & L.A. Court - 3",
        "Accra High Court - Financial & Economic Crime Court",
        "Accra High Court - Human Rights Court - 1",
        "Accra High Court - Human Rights Court - 2",
        "Tema High Court - A",
        "Tema High Court - B",
        "Tema Land Court - C",
        "Tema Land Court - D",
        "Adenta High Court - 1",
        "Adenta High Court - 2",
        "Amasaman High Court - 1",
        "Amasaman High Court - 2",
        "Sowutuom High Court",
        "Gbetsile High Court",
    ])
    add("Greater Accra Region", "Circuit Court", [
        "Accra Circuit Court - 1",
        "Accra Circuit Court - 2",
        "Accra Circuit Court - 3",
        "Accra Circuit Court - 4",
        "Accra Circuit Court - 5 (GBVC)",
        "Accra Circuit Court - 6",
        "Accra Circuit Court - 7",
        "Accra Circuit Court - 8",
        "Accra Circuit Court - 9",
        "Accra Circuit Court - 10",
        "Accra Circuit Court - 11",
        "Amasaman Circuit Court (GBVC)",
        "Ashaiman Circuit Court",
        "Tema Circuit Court - A (GBVC)",
        "Tema Circuit Court - B",
        "Dome - Kwabenya Circuit Court",
        "Weija Circuit Court (GBVC)",
        "Adenta Circuit Court - A",
        "Adenta Circuit Court - B (GBVC)",
        "Police HQ Circuit Court (GBVC)",
        "Dansoman Circuit Court",
        "Achimota Circuit Court",
        "Gbetsile Circuit Court",
        "Ada Circuit Court",
    ])
    add("Greater Accra Region", "District Court", [
        "Adenta District Court - 1",
        "Adenta District Court - 2",
        "Ada District Court",
        "Amasaman District Court - A",
        "Amasaman District Court - B",
        "Madina District Court - A",
        "Madina District Court - B",
        "La District Court",
        "Adabraka District Court",
        "Achimota District Court",
        "Dodowa District Court",
        "Family & Juvenile Court",
        "Ashaiman District Court",
        "Teshie/Nungua District Court",
        "Weija District Court",
        "Sege District Court",
        "Tema District Court - 1 (Whitehouse)",
        "Tema District Court - 2 (Community Centre)",
        "Tema District Court (TDC)",
        "Prampram District Court",
        "Sowutuom District Court",
        "DOVVSU, Police HQ District Court",
        "Asofan - Ofankor District Court",
        "Ngleshie Amanfro District Court",
        "Gbese District Court",
        "Baatsona - Spintex District Court",
        "Kotobabi District Court - 1",
        "Kotobabi District Court - 2",
        "Kpone District Court",
        "A.M.A District Court (Sanitation Court)",
    ])

    add("Volta Region", "High Court", [
        "Ho High Court - 1",
        "Ho High Court - 2",
        "Ho High Court - 3",
        "Denu High Court",
        "Hohoe High Court",
        "Sogakope High Court",
    ])
    add("Volta Region", "Circuit Court", [
        "Ho Circuit Court (GBVC)",
        "Hohoe Circuit Court",
        "Keta Circuit Court",
        "Kpando Circuit Court",
        "Sogakope Circuit Court",
        "Denu Circuit Court",
        "Juapong Circuit Court",
    ])
    add("Volta Region", "District Court", [
        "Abor District Court",
        "Adidome District Court",
        "Agbozume District Court",
        "Akatsi District Court",
        "Dabala District Court",
        "Dzodze District Court",
        "Ho District Court - 1",
        "Ho District Court - 2",
        "Hohoe District Court",
        "Peki District Court",
        "Ve-Golokuati District Court",
        "Ave-Dakpa District Court",
        "Dzolokpuita District Court",
        "Vakpo District Court",
        "Kpetoe District Court",
        "Adaklu District Court",
        "Anloga District Court",
        "Kpando District Court",
        "Battor District Court",
        "Nogokpo District Court",
    ])

    add("Oti Region", "High Court", [
        "Dambai High Court",
    ])
    add("Oti Region", "Circuit Court", [
        "Jasikan Circuit Court",
        "Dambai Circuit Court",
    ])
    add("Oti Region", "District Court", [
        "Jasikan District Court",
        "Kete-Krachi District Court",
        "Nkwanta District Court",
        "Dambai District Court",
        "Kpassa District Court",
        "Kadjebi District Court",
        "New Ayoma District Court",
        "Chinderi District Court",
        "Nkonya/Kwamekrom District Court",
    ])

    add("Eastern Region", "Court of Appeal", [
        "Court of Appeal, Koforidua",
    ])
    add("Eastern Region", "High Court", [
        "Koforidua High Court (General)",
        "High Court - 1",
        "High Court - 2",
        "Commercial Courts - A",
        "Commercial Courts - B",
        "Akim Oda High Court",
        "Nkawkaw High Court",
        "Nsawam High Court",
        "Nsawam (MS) Prison High Court",
        "Somanya High Court",
        "Kibi High Court",
        "Odumase Krobo High Court",
    ])
    add("Eastern Region", "Circuit Court", [
        "Koforidua Circuit Court - A (GBVC)",
        "Koforidua Circuit Court - B",
        "Akropong Akwapim Circuit Court",
        "Asamankese Circuit Court",
        "Mpraeso Circuit Court",
        "Nsawam Circuit Court",
        "Odumase Krobo Circuit Court",
        "Akim Swedru Circuit Court",
        "Anyinam Circuit Court",
        "Suhum Circuit Court",
        "Kibi Circuit Court",
        "Nkwatia Circuit Court",
        "New Abirem Circuit Court",
    ])
    add("Eastern Region", "District Court", [
        "Koforidua District Court - A",
        "Koforidua District Court - B",
        "New Tafo District Court",
        "Abetifi District Court",
        "Akim Oda District Court",
        "Akim Ofoase District Court",
        "Asamankese District Court",
        "Asesewa District Court",
        "Begoro District Court",
        "Donkorkrom District Court",
        "Kade District Court",
        "Kibi District Court",
        "Kwabeng District Court",
        "Mampong Akwapim District Court",
        "Nkawkaw District Court",
        "Nsawam District Court",
        "Senchi District Court",
        "Somanya District Court",
        "Suhum District Court",
        "New Abirem District Court",
        "Aburi District Court",
        "Osino District Court",
        "Kraboa Coaltar District Court",
        "Akwatia District Court",
    ])

    add("Ashanti Region", "Court of Appeal", [
        "Court of Appeal, Kumasi",
    ])
    add("Ashanti Region", "High Court", [
        "Kumasi High Court (General)",
        "Land Court - 1",
        "Land Court - 2",
        "Criminal & Financial Crime",
        "Criminal & General",
        "General Jurisdiction - 5",
        "General Jurisdiction - 6",
        "General Jurisdiction - 7",
        "Human Rights, Labour, Environmental & Land Law",
        "Commercial Court - 1",
        "Commercial Court - 2",
        "Mampong High Court",
        "Obuasi High Court",
        "Prisons High Court, Kumasi",
        "Offinso High Court",
    ])
    add("Ashanti Region", "Circuit Court", [
        "Kumasi Circuit Court - 1 (GBVC)",
        "Kumasi Circuit Court - 2",
        "Kumasi Circuit Court - 3",
        "Kumasi Circuit Court - 4",
        "Bekwai Circuit Court",
        "Juaso Circuit Court",
        "Kumasi - K.M.A. Circuit Court",
        "Kumawu Circuit Court (GBVC)",
        "Nkawie Circuit Court",
        "Nsuta Circuit Court",
        "Obuasi Circuit Court",
        "Offinso Circuit Court",
        "Tepa Circuit Court",
        "Juabeng Circuit Court",
        "Akropong Ashanti Circuit Court (GBVC)",
        "Old Tafo Circuit Court",
        "Asokwa Circuit Court - 1",
        "Asokwa Circuit Court - 2",
        "Atasemanso Circuit Court",
        "Abuakwa Circuit Court",
        "Kwadaso Circuit Court",
        "Donyina Circuit Court",
    ])
    add("Ashanti Region", "District Court", [
        "Prempeh Assembly Hall District Court - 1",
        "Prempeh Assembly Hall District Court - 2",
        "Akropong District Court",
        "Asokore Mampong District Court",
        "Akomadan District Court",
        "Agogo District Court",
        "Agona District Court",
        "Asiwa District Court",
        "Asokwa District Court - 1",
        "Asokwa District Court - 2",
        "Asokwa District Court - 3",
        "Asokwa District Court - 4",
        "Bekwai District Court",
        "Effiduase District Court",
        "Ejisu District Court",
        "Kodie District Court",
        "Konongo District Court",
        "Kuntunase District Court",
        "Kwaso District Court",
        "Mampong District Court",
        "Mamponteng District Court",
        "Mankranso District Court",
        "Manso Nkwanta District Court",
        "New Edubiase District Court",
        "Nyinahin District Court",
        "Obuasi District Court",
        "Offinso District Court",
        "Tepa District Court",
        "Twedie District Court",
        "Ejura District Court",
        "Fomena District Court",
        "Jacobu District Court",
        "Manso Adubia District Court",
        "Toase District Court",
        "Pakyi No. 2 District Court",
        "Bonwire District Court",
        "Bompata District Court",
        "Boamang District Court",
        "Drobonso District Court",
        "Wiamoase District Court",
        "Pokukrom District Court",
        "Ntonso District Court",
        "Suame District Court",
        "Adansi Asokwa District Court",
    ])

    add("Bono Region", "High Court", [
        "Sunyani High Court (General) - High Court - 1",
        "Sunyani High Court (General) - High Court - 2",
        "Sunyani High Court (General) - High Court - 3",
        "Sunyani High Court (General) - Commercial Court",
        "Wenchi High Court",
    ])
    add("Bono Region", "Circuit Court", [
        "Sunyani Circuit Court",
        "Fiapre Circuit Court",
        "Dormaa Ahenkro Circuit Court (GBVC)",
        "Berekum Circuit Court",
        "Wenchi Circuit Court",
    ])
    add("Bono Region", "District Court", [
        "Sunyani District Court - A",
        "Sunyani District Court - B",
        "Berekum District Court",
        "Drobo District Court",
        "Sampa District Court",
        "Wenchi District Court",
        "Wamfie District Court",
        "Nsoatre District Court",
        "Nkrankwanta District Court",
        "Nsawkaw District Court",
    ])

    add("Bono East Region", "High Court", [
        "Techiman High Court",
        "Atebubu High Court",
    ])
    add("Bono East Region", "Circuit Court", [
        "Techiman Circuit Court (GBVC)",
        "Kintampo Circuit Court",
        "Atebubu Circuit Court",
    ])
    add("Bono East Region", "District Court", [
        "Atebubu District Court",
        "Kintampo District Court",
        "Techiman District Court",
        "Kwame Danso District Court",
        "Nkoranza District Court",
        "Tuobodom District Court",
        "Yeji District Court",
        "Jema District Court",
    ])

    add("Ahafo Region", "Circuit Court", [
        "Goaso Circuit Court (GBVC)",
        "Duayaw Nkwanta Circuit Court",
        "Hwidiem Circuit Court",
    ])
    add("Ahafo Region", "District Court", [
        "Goaso District Court",
        "Bechem District Court",
        "Kenyasi District Court",
        "Duayaw Nkwanta District Court",
        "Kukuom District Court",
    ])

    add("Northern Region", "Court of Appeal", [
        "Court of Appeal, Tamale",
    ])
    add("Northern Region", "High Court", [
        "Tamale High Court (General)",
        "High Court - 1",
        "High Court - 2",
        "Tamale Commercial Court",
    ])
    add("Northern Region", "Circuit Court", [
        "Tamale Circuit Court",
        "Tamale Gender Based Violence Court (GBVC)",
        "Yendi Circuit Court",
    ])
    add("Northern Region", "District Court", [
        "Tamale District Court - 1",
        "Tamale District Court - 2",
        "Bimbila District Court",
        "Wulensi District Court",
        "Kpandai District Court",
    ])

    add("Savannah Region", "High Court", [
        "Damongo High Court",
    ])
    add("Savannah Region", "Circuit Court", [
        "Damongo Circuit Court (GBVC)",
    ])
    add("Savannah Region", "District Court", [
        "Bole District Court",
        "Salaga District Court",
        "Buipe District Court",
    ])

    add("North-East Region", "High Court", [
        "Nalerigu High Court",
    ])
    add("North-East Region", "Circuit Court", [
        "Nalerigu Circuit Court (GBVC)",
    ])
    add("North-East Region", "District Court", [
        "Nalerigu District Court",
        "Walewale District Court",
        "Chereponi District Court",
        "Yagaba District Court",
        "Gambaga District Court",
        "Nankpanduri District Court",
    ])

    add("Upper-East Region", "High Court", [
        "Bolgatanga High Court - 1",
        "Bolgatanga High Court - 2",
    ])
    add("Upper-East Region", "Circuit Court", [
        "Bawku Circuit Court",
        "Bolgatanga Circuit Court (GBVC)",
    ])
    add("Upper-East Region", "District Court", [
        "Bawku District Court",
        "Bolgatanga District Court",
        "Bongo District Court",
        "Navrongo District Court",
        "Sandema District Court",
        "Zebilla District Court",
        "Garu District Court",
        "Pusiga District Court",
        "Zuarungu District Court",
    ])

    add("Upper-West Region", "High Court", [
        "Wa High Court",
    ])
    add("Upper-West Region", "Circuit Court", [
        "Wa Circuit Court",
        "Lawra Circuit Court",
    ])
    add("Upper-West Region", "District Court", [
        "Wa District Court",
        "Tumu District Court",
        "Nandom District Court",
        "Jirapa District Court",
        "Nadowli District Court",
    ])

    return courts


def seed_courts():
    courts = build_courts()
    db = SessionLocal()
    inserted = 0

    try:
        db.execute(text("SELECT setval('courts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM courts))"))
        for court in courts:
            name = court["name"]
            court_type = court["court_type"]
            region = court["region"]

            exists = db.query(Court).filter(
                func.lower(Court.name) == name.lower(),
                func.lower(Court.court_type) == court_type.lower(),
                func.lower(Court.region) == region.lower(),
            ).first()
            if exists:
                continue

            db.add(Court(
                name=name,
                court_type=court_type,
                region=region,
                location=name,
                registry_name=None,
            ))
            inserted += 1

        db.commit()
    finally:
        db.close()

    print(f"Inserted {inserted} courts (skipped {len(courts) - inserted}).")


if __name__ == "__main__":
    seed_courts()
