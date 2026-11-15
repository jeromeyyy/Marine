import { Router, Request, Response } from 'express';
import multer from 'multer';

import { getPostgresPool } from '../db/postgres.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export interface OtolithSpeciesInfo {
  index: number;
  species: string;
  common_name: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  description: string;
}

const OTOLITH_SPECIES_LIST: OtolithSpeciesInfo[] = [
  {
    index: 1,
    species: 'Synagrops japonicus',
    common_name: 'Blackmouth Splitfin / Japanese Splitfin',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Acropomatiformes',
    family: 'Acropomatidae',
    genus: 'Synagrops',
    description: 'Benthopelagic marine teleost found in deep continental shelf and upper bathyal slopes.'
  },
  {
    index: 2,
    species: 'Psenopsis obscura',
    common_name: 'Obscure Driftfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Centrolophidae',
    genus: 'Psenopsis',
    description: 'Mesopelagic to bathypelagic driftfish inhabiting deep Indian Ocean offshore channels.'
  },
  {
    index: 3,
    species: 'Chlorophthalmus acutifrons',
    common_name: 'Sharpnose Greeneye',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Aulopiformes',
    family: 'Chlorophthalmidae',
    genus: 'Chlorophthalmus',
    description: 'Demersal species with prominent iridescent green eyes adapted for low-light benthic foraging.'
  },
  {
    index: 4,
    species: 'Polymixia fusca',
    common_name: 'Dusky Beardfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Polymixiiformes',
    family: 'Polymixiidae',
    genus: 'Polymixia',
    description: 'Deep-water species with chin barbels used to detect benthic invertebrates on continental slopes.'
  },
  {
    index: 5,
    species: 'Hoplostethus melanopus',
    common_name: 'Smallscale Slimehead / Black Oreo',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Trachichthyiformes',
    family: 'Trachichthyidae',
    genus: 'Hoplostethus',
    description: 'Deep-sea benthopelagic fish with distinctive concave notched otolith morphology found at 400-900m depths.'
  },
  {
    index: 6,
    species: 'Alepocephalus blanfordii',
    common_name: "Blanford's Slickhead",
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Alepocephaliformes',
    family: 'Alepocephalidae',
    genus: 'Alepocephalus',
    description: 'Deep-sea slickhead found across the northern and western Indian continental slopes.'
  },
  {
    index: 7,
    species: 'Narcetes stomias',
    common_name: 'Deepsea Blackhead',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Alepocephaliformes',
    family: 'Alepocephalidae',
    genus: 'Narcetes',
    description: 'Bathypelagic predator with broad gape inhabiting twilight and aphotic marine strata.'
  },
  {
    index: 8,
    species: 'Lamprogrammus niger',
    common_name: 'Black Cusk-eel',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Ophidiiformes',
    family: 'Ophidiidae',
    genus: 'Lamprogrammus',
    description: 'Bathydemersal cusk-eel characterized by heavy saccular otoliths in deep sediment basins.'
  },
  {
    index: 9,
    species: 'Aphanopus microphthalmus',
    common_name: 'Small-eye Scabbardfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Trichiuridae',
    genus: 'Aphanopus',
    description: 'Elongated predatory ribbon-like fish capable of extensive dial vertical migrations.'
  },
  {
    index: 10,
    species: 'Bathyuroconger vicinus',
    common_name: 'Large-toothed Conger',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Anguilliformes',
    family: 'Congridae',
    genus: 'Bathyuroconger',
    description: 'Deep benthic conger eel with powerful dentition adapted for continental shelf edges.'
  },
  {
    index: 11,
    species: 'Bathypterois atricolor',
    common_name: 'Attenuated Spiderfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Aulopiformes',
    family: 'Ipnopidae',
    genus: 'Bathypterois',
    description: 'Abyssal tripodfish using elongated fin rays to perch upon ocean floor currents.'
  },
  {
    index: 12,
    species: 'Gephyroberyx darwinii',
    common_name: "Darwin's Slimehead",
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Trachichthyiformes',
    family: 'Trachichthyidae',
    genus: 'Gephyroberyx',
    description: 'Long-lived benthopelagic roughy with large, sculptured sagitta otolith rings.'
  },
  {
    index: 13,
    species: 'Saurida tumbil',
    common_name: 'Greater Lizardfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Aulopiformes',
    family: 'Synodontidae',
    genus: 'Saurida',
    description: 'High-biomass demersal marine predator inhabiting sandy muddy bottoms across the Indian shelf.'
  },
  {
    index: 14,
    species: 'Grammoplites suppositus',
    common_name: 'Spotfin Flathead',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Perciformes',
    family: 'Platycephalidae',
    genus: 'Grammoplites',
    description: 'Benthic ambush predator camouflaged on sand-mud substrata across coastal waters.'
  },
  {
    index: 15,
    species: 'Rexea prometheoides',
    common_name: 'Royal Gempylid / Promethean Snake Mackerel',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Gempylidae',
    genus: 'Rexea',
    description: 'Benthopelagic schooling predator with fast swimming dynamics on outer shelf breaks.'
  },
  {
    index: 16,
    species: 'Beryx splendens',
    common_name: 'Splendid Alfonsino',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Beryciformes',
    family: 'Berycidae',
    genus: 'Beryx',
    description: 'Vivid red commercially valued fish congregating around seamounts and deep ridges.'
  },
  {
    index: 17,
    species: 'Atrobucca nibe',
    common_name: 'Blackmouth Croaker',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Perciformes',
    family: 'Sciaenidae',
    genus: 'Atrobucca',
    description: 'Sciaenid species renowned for thick, dense otoliths used in sound production and depth sense.'
  },
  {
    index: 18,
    species: 'Nemipterus japonicus',
    common_name: 'Japanese Threadfin Bream',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Perciformes',
    family: 'Nemipteridae',
    genus: 'Nemipterus',
    description: 'Key commercial demersal species forming dominant component of multi-day trawler catches.'
  },
  {
    index: 19,
    species: 'Pterygotrigla hemisticta',
    common_name: 'Spotted Gurnard',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Perciformes',
    family: 'Triglidae',
    genus: 'Pterygotrigla',
    description: 'Armored bottom dweller utilizing finger-like pectoral rays for sensory crawling.'
  },
  {
    index: 20,
    species: 'Bembrops caudimacula',
    common_name: 'Spotted Duckbill',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Perciformes',
    family: 'Bembropidae',
    genus: 'Bembrops',
    description: 'Slender duckbill fish inhabiting soft sediments along the Indian continental margin.'
  },
  {
    index: 21,
    species: 'Neoepinnula orientalis',
    common_name: 'Netbeard Sackfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Gempylidae',
    genus: 'Neoepinnula',
    description: 'Oceanic snake mackerel found in mesopelagic depths with sharp rostral profile.'
  },
  {
    index: 22,
    species: 'Physiculus roseus',
    common_name: 'Rosy Codling',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Gadiformes',
    family: 'Moridae',
    genus: 'Physiculus',
    description: 'Deep-water morid cod equipped with bioluminescent ventral organs.'
  },
  {
    index: 23,
    species: 'Trichiurus lepturus',
    common_name: 'Largehead Hairtail / Ribbonfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Trichiuridae',
    genus: 'Trichiurus',
    description: 'Major pelagic fishery resource of economic importance with high voracity.'
  },
  {
    index: 24,
    species: 'Hoplostethus rubellopterus',
    common_name: 'Red-finned Slimehead',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Trachichthyiformes',
    family: 'Trachichthyidae',
    genus: 'Hoplostethus',
    description: 'Bathyal roughy species associated with deep oceanic canyons of the Arabian Sea.'
  },
  {
    index: 25,
    species: 'Satyrichthys milleri',
    common_name: "Miller's Armored Gurnard",
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Perciformes',
    family: 'Peristediidae',
    genus: 'Satyrichthys',
    description: 'Heavily armored peristediid with rostral projections grazing upon epibenthic fauna.'
  },
  {
    index: 26,
    species: 'Ostracoberyx dorygenys',
    common_name: 'Spiny-brow Flathead',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Acropomatiformes',
    family: 'Ostracoberycidae',
    genus: 'Ostracoberyx',
    description: 'Rare archaic deep-water teleost with prominent preopercular spines.'
  },
  {
    index: 27,
    species: 'Cubiceps baxteri',
    common_name: 'Black Cubehead / Cigarfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Nomeidae',
    genus: 'Cubiceps',
    description: 'Epipelagic to mesopelagic schooling fish feeding on siphonophores and salps.'
  },
  {
    index: 28,
    species: 'Chlorophthalmus corniger',
    common_name: 'Shortnose Greeneye',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Aulopiformes',
    family: 'Chlorophthalmidae',
    genus: 'Chlorophthalmus',
    description: 'Deep-sea greeneye species with iridescent eyes adapted to mesopelagic depths.'
  },
  {
    index: 29,
    species: 'Diretmoides veriginae',
    common_name: 'Indian Spinyfin / Discfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Trachichthyiformes',
    family: 'Diretmidae',
    genus: 'Diretmoides',
    description: 'Discoidal silver-black bathypelagic fish with thin, delicate fin rays.'
  },
  {
    index: 30,
    species: 'Alepocephalus bicolor',
    common_name: 'Bicolor Slickhead',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Alepocephaliformes',
    family: 'Alepocephalidae',
    genus: 'Alepocephalus',
    description: 'Deep-sea slickhead inhabiting continental slope waters of the Arabian Sea.'
  },
  {
    index: 31,
    species: 'Lamprogrammus fragilis',
    common_name: 'Fragile Cusk-eel',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Ophidiiformes',
    family: 'Ophidiidae',
    genus: 'Lamprogrammus',
    description: 'Deep slope ophidiid found in soft mud bottoms at depths exceeding 600m.'
  },
  {
    index: 32,
    species: 'Coloconger raniceps',
    common_name: 'Froghead Short-tail Eel',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Anguilliformes',
    family: 'Colocongridae',
    genus: 'Coloconger',
    description: 'Bulbous stout-bodied eel species endemic to benthic bathyal sediments.'
  },
  {
    index: 33,
    species: 'Xenomystax trucidans',
    common_name: 'Fierce Moray Conger',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Anguilliformes',
    family: 'Congridae',
    genus: 'Xenomystax',
    description: 'Sharp-toothed congrid with elongated jaws active in twilight continental zones.'
  },
  {
    index: 34,
    species: 'Neobathyclupea elongata',
    common_name: 'Deepsea Keel-belly Herring',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Acropomatiformes',
    family: 'Bathyclupeidae',
    genus: 'Neobathyclupea',
    description: 'Silvery compressed teleost with large eyes dwelling near continental drop-offs.'
  },
  {
    index: 35,
    species: 'Talismania longifilis',
    common_name: 'Long-filament Slickhead',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Alepocephaliformes',
    family: 'Alepocephalidae',
    genus: 'Talismania',
    description: 'Bathyal slickhead characterized by elongated pectoral filaments.'
  },
  {
    index: 36,
    species: 'Gavialiceps taeniola',
    common_name: 'Tape-snake Conger / Duckbill Eel',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Anguilliformes',
    family: 'Muraenesocidae',
    genus: 'Gavialiceps',
    description: 'Ultra-elongated eel with duckbill-like rostrum foraging in deep Indian Ocean trenches.'
  },
  {
    index: 37,
    species: 'Psenopsis cyanea',
    common_name: 'Blue Driftfish',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Actinopterygii',
    order: 'Scombriformes',
    family: 'Centrolophidae',
    genus: 'Psenopsis',
    description: 'Deep-bodied driftfish supporting important off-shelf mesopelagic biomass.'
  }
];


async function callMLService(imageBuffer: Buffer, filename: string, mimeType: string) {
  const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  const FormDataCtor = (globalThis as any).FormData;
  const BlobCtor = (globalThis as any).Blob;
  const formData = new FormDataCtor();
  const fileBlob = new BlobCtor([imageBuffer], { type: mimeType });
  formData.append('image', fileBlob, filename);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${mlServiceUrl}/predict/otolith`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ML service returned status ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

router.post('/predict', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    let mlPrediction: any;
    try {
      mlPrediction = await callMLService(req.file.buffer, req.file.originalname, req.file.mimetype);
    } catch {
      // No fabricated fallback: without the ML service there is no real
      // classification to report.
      return res.status(503).json({
        success: false,
        error: 'Otolith classification service unavailable: no ML service is configured or reachable for this deployment'
      });
    }

    const predictedName = String(mlPrediction.species || '').trim();
    if (!predictedName) {
      return res.status(502).json({ success: false, error: 'ML service returned no prediction' });
    }
    const confidence = Number(mlPrediction.confidence || 0);

    // Taxonomy enrichment only: the hardcoded list may annotate a REAL
    // predicted label, never substitute for one.
    const found = OTOLITH_SPECIES_LIST.find(
      s => s.species.toLowerCase() === predictedName.toLowerCase()
    );

    // Pass through real candidates from the ML service when provided;
    // never synthesize alternates.
    const topCandidates = Array.isArray(mlPrediction.top_k) && mlPrediction.top_k.length > 0
      ? mlPrediction.top_k.map((c: any) => ({
          species: String(c.species || c.label || ''),
          confidence: Number(c.confidence || c.score || 0)
        }))
      : [{ species: predictedName, confidence }];

    return res.json({
      success: true,
      species: predictedName,
      confidence,
      inferenceSource: 'ml-microservice',
      backend: mlPrediction.backend || null,
      validation: mlPrediction.validation || null,
      taxonomy: found ? {
        kingdom: found.kingdom,
        phylum: found.phylum,
        class: found.class,
        order: found.order,
        family: found.family,
        genus: found.genus,
        common_name: found.common_name,
        description: found.description
      } : null,
      topCandidates
    });
  } catch (error: any) {
    console.error('Otolith prediction route error:', error);
    return res.status(500).json({ error: error.message || 'Otolith prediction failed' });
  }
});

router.get('/detected-species', async (_req: Request, res: Response) => {
  try {
    const list = OTOLITH_SPECIES_LIST.map((sp) => ({
      species: sp.species,
      common_name: sp.common_name,
      family: sp.family,
      genus: sp.genus,
      order: sp.order,
      class: sp.class
    }));
    // Label inventory only; no detection counts are recorded anywhere, so
    // none are reported.
    return res.json({ success: true, data: list, note: 'Classifier label inventory, not observed detections' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve detected species' });
  }
});

export default router;
