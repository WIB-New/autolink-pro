import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.vehicles.models import Vehicle, VehiclePhoto
from django.core.files.base import ContentFile
import urllib.request

SUV_EXT = [
 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=900&q=75',
 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=75',
 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900&q=75',
]
SEDAN_EXT = [
 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&q=75',
 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=900&q=75',
 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=75',
]
CITY_EXT = [
 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=900&q=75',
 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=900&q=75',
 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=900&q=75',
]
INTERIOR = [
 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&q=75',
 'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=900&q=75',
]

def pick_ext(v):
    cat = ((v.category or '') + ' ' + (v.model or '')).lower()
    if any(k in cat for k in ('suv', '4x4', 'cruiser', 'duster', 'x7', 'rav4', 'sorento', 'prado')):
        return SUV_EXT
    if 'citadine' in cat or '208' in cat:
        return CITY_EXT
    return SEDAN_EXT

DESC = {
 'Toyota RAV4 AWD Hybrid': "Toyota RAV4 AWD Hybrid 2022 — le SUV compact polyvalent par excellence pour le Cameroun. Transmission integrale AWD et motorisation hybride essence/electrique : puissance a la demande et consommation maitrisee, ideale pour les axes Douala-Yaounde comme pour les pistes laterales. Interieur spacieux 5 places, coffre genereux pour les bagages long-courrier, climatisation automatique performante meme en zone equatoriale. Vehicule inspecte par nos experts terrain : freinage, suspension et pneus verifies — parfait pour les trajets interurbains avec chauffeur ou en autonomie.",
 'Mercedes Classe S 500': "Mercedes Classe S 500 2023 — le sommet de la gamme berline AutoLink Pro. Sieges cuir chauffants et ventiles, climatisation 4 zones, insonorisation exceptionnelle : un salon roulant pour les deplacements professionnels, les evenements ou les transferts VIP entre Douala et Yaounde. Conduite souple et stable meme a vitesse soutenue, equipements premium (ecran central, GPS, camera 360). Fourni avec notre chauffeur certifie bilingue pour une experience executive complete — documents, assurance tous risques et controle technique en regle.",
 'BMW X7': "BMW X7 2023 — le grand SUV luxueux 7 places pour les groupes exigeants. Interieur cuir premium, toit panoramique, suspension pneumatique adaptative : le confort de la limousine avec la stature d'un vrai 4x4. Ideal pour les delegations, mariages et transports VIP — ses 7 places cuir offrent un espace rare dans le parc. Transmission automatique 8 rapports, traction integrale xDrive, aide au stationnement. Vehicule inspecte, entretenu au carnet, documents et assurance Activa a jour.",
 'Toyota Land Cruiser Prado': "Toyota Land Cruiser Prado 2022 — la reference africaine des 4x4 : robustesse legendaire, chassis echelle, grande garde au sol pour toutes les pistes du Cameroun (Bafoussam, Kribi, axes nord). 7 places, diesel sobre pour sa categorie, coffre immense. Le choix des familles nombreuses et des missions longue distance ou la fiabilite prime. Controle technique et carnet d'entretien complets, pneus neufs — pret pour l'interurbain et l'aventure.",
 'Toyota Corolla': "Toyota Corolla 2021 — la berline fiable et economique pour la ville comme pour les trajets interurbains. Consommation maitrisee, confort de marche remarquable sur route degradee, climatisation efficace. 5 places, coffre correct pour les courses et les bagages weekend. Entretien Toyota simple et peu couteux : le choix des budgets maitres sans compromis sur la securite ni le confort.",
 'Toyota Avensis': "Toyota Avensis 2014 — berline familiale eprouvee, confortable et sobre. Habitable, silencieuse sur route, entretien raisonnable : le bon choix pour les trajets professionnels reguliers et les longues distances au depart de Yaounde. Mecanique verifiee par nos experts, pneumatiques recents — un usage quotidien sans surprise.",
 'Hyundai Elantra': "Hyundai Elantra 2018 — berline moderne au design fluide et aux equipements bien fournis (ecran tactile, camera de recul, Bluetooth). Conduite douce et agile en ville, confortable sur autoroute. 5 places, coffre pratique — parfaite pour les deplacements professionnels au depart de Douala. Mecanique revisee, climatisation performante, documentation complete.",
 'Kia Sorento': "Kia Sorento 2022 — le SUV familial 7 places au rapport qualite-prix remarquable. Interieur modulable, coffre adaptable, moteur diesel coupleux pour les charges et les cotes. Attelage possible, equipements securite complets (controle de trajectoire, airbags multiples). Parfait pour les familles nombreuses et les sorties de ville en groupe.",
 'Peugeot 208': "Peugeot 208 2020 — la citadine agile et chic pour la circulation urbaine de Douala et Yaounde. Faible consommation diesel, direction legere, stationnement facile — la plus pratique pour les courses quotidiennes et les deplacements rapides en ville. Design interieur i-Cockpit moderne, ecran tactile, Apple CarPlay. Economique au quotidien, parfaite en premier vehicule.",
 'Dacia Duster': "Dacia Duster — le SUV accessible et baroudeur : 4x4 capable sur les chemins, sobre, pratique. Position de conduite haute, garde au sol genereuse, coffre correct — le choix budget-malin pour les zones difficiles ou les trajets mixtes ville/piste. Entretien simple et economique, mecanique fiable — un baroudeur sans fioritures mais serieux.",
}

def fetch(url):
    try:
        return urllib.request.urlopen(url, timeout=15).read()
    except Exception:
        return None

for v in Vehicle.objects.filter(status='approved'):
    urls = [u for u in [v.image_url] + pick_ext(v) + INTERIOR if u][:5]
    v.photos.all().delete()
    ok = 0
    for i, url in enumerate(urls):
        data = fetch(url)
        if data:
            pos = 'interior' if i >= len(urls) - 2 else 'exterior'
            VehiclePhoto.objects.create(vehicle=v, position=pos,
                caption=f'{v.brand} {v.model} — {"Interieur" if pos == "interior" else "Vue " + str(i + 1)}',
                image=ContentFile(data, name=f'v{v.id}_{i}.jpg'))
            ok += 1
    desc = DESC.get(f'{v.brand} {v.model}') or DESC.get(v.brand)
    if desc:
        v.description = desc
        v.save()
    print(v.id, v.brand, v.model, '->', ok, 'photos | desc', len(v.description or ''), 'ch')
