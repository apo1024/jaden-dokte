/* Jaden Doktè — diagnostic sur l'appareil (DINOv2-small PlantVillage, ONNX 8 bits, CC BY-SA 4.0), sans compte ni envoi de photo.
   Renvoie le même objet que l'ancienne analyse : {crop,status,problem,certainty,description,signs,now,natural,products,prevent,help} */
const Dokte = (() => {
  const LABELS = ['Apple___Apple_scab','Apple___Black_rot','Apple___Cedar_apple_rust','Apple___healthy','Blueberry___healthy','Cherry_(including_sour)___Powdery_mildew','Cherry_(including_sour)___healthy','Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot','Corn_(maize)___Common_rust_','Corn_(maize)___Northern_Leaf_Blight','Corn_(maize)___healthy','Grape___Black_rot','Grape___Esca_(Black_Measles)','Grape___Leaf_blight_(Isariopsis_Leaf_Spot)','Grape___healthy','Orange___Haunglongbing_(Citrus_greening)','Peach___Bacterial_spot','Peach___healthy','Pepper,_bell___Bacterial_spot','Pepper,_bell___healthy','Potato___Early_blight','Potato___Late_blight','Potato___healthy','Raspberry___healthy','Soybean___healthy','Squash___Powdery_mildew','Strawberry___Leaf_scorch','Strawberry___healthy','Tomato___Bacterial_spot','Tomato___Early_blight','Tomato___Late_blight','Tomato___Leaf_Mold','Tomato___Septoria_leaf_spot','Tomato___Spider_mites Two-spotted_spider_mite','Tomato___Target_Spot','Tomato___Tomato_Yellow_Leaf_Curl_Virus','Tomato___Tomato_mosaic_virus','Tomato___healthy'];
  /* culture choisie (index dans la liste) → préfixe des classes du modèle */
  const CROP_PREFIX = { 0: 'Tomato', 1: 'Corn', 12: 'Pepper', 15: 'Potato', 16: 'Orange', 17: 'Squash', 18: 'Strawberry', 19: 'Grape', 20: 'Peach', 21: 'Apple' };
  const CROP_NAME = { Tomato: { fr: 'Tomate', ht: 'Tomat' }, Corn: { fr: 'Maïs', ht: 'Mayi' }, Pepper: { fr: 'Piment / poivron', ht: 'Piman' }, Potato: { fr: 'Pomme de terre', ht: 'Pòmdetè' },
    Orange: { fr: 'Orange / citron', ht: 'Zoranj / sitwon' }, Squash: { fr: 'Courge / giraumon', ht: 'Joumou' }, Strawberry: { fr: 'Fraise', ht: 'Frèz' }, Grape: { fr: 'Raisin', ht: 'Rezen' },
    Peach: { fr: 'Pêche', ht: 'Pèch' }, Apple: { fr: 'Pomme', ht: 'Pòm' }, Cherry: { fr: 'Cerise', ht: 'Seriz' }, Blueberry: { fr: 'Myrtille', ht: 'Mitiy' }, Raspberry: { fr: 'Framboise', ht: 'Franbwaz' }, Soybean: { fr: 'Soja', ht: 'Soya' } };
  let sess = null, FICHES = null;
  async function load(onStatus) {
    if (!FICHES) FICHES = await (await fetch('fiches.json')).json();
    if (sess) return sess;
    onStatus && onStatus('…');
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
    ort.env.wasm.proxy = true;
    ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
    sess = await ort.InferenceSession.create('plantes-q8.onnx', { executionProviders: ['wasm'] });
    return sess;
  }
  /* prétraitement : côté court 256, recadrage central 224, normalisation ImageNet */
  function tensor(img) {
    const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height, k = 256 / Math.min(W, H);
    const rw = Math.round(W * k), rh = Math.round(H * k);
    const c = document.createElement('canvas'); c.width = 224; c.height = 224;
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(img, -(rw - 224) / 2, -(rh - 224) / 2, rw, rh);
    const px = g.getImageData(0, 0, 224, 224).data, n = 224 * 224, x = new Float32Array(3 * n);
    const M = [0.485, 0.456, 0.406], S = [0.229, 0.224, 0.225];
    for (let i = 0; i < n; i++) for (let ch = 0; ch < 3; ch++) x[ch * n + i] = (px[i * 4 + ch] / 255 - M[ch]) / S[ch];
    return new ort.Tensor('float32', x, [1, 3, 224, 224]);
  }
  const healthy = (pre) => ({
    status: 'ok', problem: { fr: 'Aucune maladie détectée', ht: 'Pa gen maladi nou wè' }, certainty: 'prob',
    description: { fr: 'Les feuilles analysées ressemblent à celles d’une plante en bonne santé.', ht: 'Fèy yo sanble ak fèy yon plant ki an sante.' },
    signs: { fr: ['Feuillage vert et régulier', 'Pas de taches ni de moisissure visibles'], ht: ['Fèy yo vèt epi regilye', 'Pa gen tach ni kanni nou wè'] },
    now: { fr: ['Continuer l’arrosage au pied, tôt le matin', 'Observer les feuilles chaque semaine'], ht: ['Kontinye wouze nan pye, bonè nan maten', 'Gade fèy yo chak semèn'] },
    natural: { fr: [], ht: [] }, products: [],
    prevent: { fr: ['Pailler le sol', 'Alterner les cultures chaque saison', 'Retirer vite toute feuille malade'], ht: ['Kouvri tè a ak pay', 'Chanje kilti chak sezon', 'Retire nenpòt fèy malad byen vit'] },
    help: { fr: '', ht: '' } });
  const unsupported = () => ({
    status: 'watch', problem: { fr: 'Culture pas encore reconnue hors ligne', ht: 'Kilti sa a poko rekonèt san entènèt' }, certainty: 'hyp',
    description: { fr: 'L’analyse sur l’appareil reconnaît pour l’instant 14 cultures (tomate, maïs, piment, pomme de terre, agrumes, giraumon…). Pour cette plante, voici les vérifications de base.', ht: 'Analiz sou telefòn nan rekonèt 14 kilti pou kounye a (tomat, mayi, piman, pòmdetè, zoranj, joumou…). Pou plant sa a, men sa pou w verifye.' },
    signs: { fr: ['Taches (brunes, noires, jaunes) ou moisissure sur les feuilles ?', 'Insectes, œufs ou toiles sous les feuilles ?', 'Feuilles qui fanent alors que le sol est humide ?'], ht: ['Tach (mawon, nwa, jòn) oswa kanni sou fèy yo ?', 'Ti bèt, ze oswa fil anba fèy yo ?', 'Fèy k ap fennen pandan tè a mouye ?'] },
    now: { fr: ['Retirer et brûler les feuilles très atteintes', 'Arroser au pied, jamais sur les feuilles', 'Prendre une photo nette d’une feuille et la montrer à un agronome'], ht: ['Retire epi boule fèy ki malad anpil', 'Wouze nan pye, pa janm sou fèy yo', 'Pran yon bon foto yon fèy epi montre yon agwonòm li'] },
    natural: { fr: ['Pulvérisation de savon noir contre pucerons et petits insectes', 'Paillage et compost pour fortifier la plante'], ht: ['Flite dlo savon nwa kont ti bèt', 'Pay ak konpòs pou bay plant lan fòs'] }, products: [],
    prevent: { fr: ['Rotation des cultures', 'Semences et boutures saines', 'Espacer les plants pour que l’air circule'], ht: ['Chanje kilti chak sezon', 'Semans ak bouti ki an sante', 'Kite espas ant plant yo pou van pase'] },
    help: { fr: 'Pour cette culture, demandez l’avis d’un agronome ou du service agricole de votre commune si le problème s’étend.', ht: 'Pou kilti sa a, mande yon agwonòm oswa sèvis agrikòl komin ou si pwoblèm nan ap gaye.' } });
  async function diagnose(img, cropIndex, onStatus) {
    const pre = CROP_PREFIX[cropIndex];
    /* culture de la liste que le modèle ne connaît pas (banane, manioc, café…) : pas de faux diagnostic. « Autre » (22) = recherche libre */
    if (!pre && cropIndex !== 22) { await load(onStatus); return unsupported(); }
    await load(onStatus);
    const out = await sess.run({ pixel_values: tensor(img) });
    const z = out.logits.data;
    const idx = LABELS.map((l, i) => i).filter(i => !pre || LABELS[i].startsWith(pre));
    let m = -Infinity; idx.forEach(i => m = Math.max(m, z[i]));
    let s = 0; const p = idx.map(i => { const e = Math.exp(z[i] - m); s += e; return e; });
    let best = 0; p.forEach((v, j) => { if (v > p[best]) best = j; });
    const lab = LABELS[idx[best]], conf = p[best] / s, cp = lab.split('___')[0].split(/[_(,]/)[0];
    const cropName = CROP_NAME[cp] || CROP_NAME[pre] || { fr: lab.split('___')[0], ht: lab.split('___')[0] };
    let d;
    if (/healthy$/.test(lab)) d = healthy();
    else d = JSON.parse(JSON.stringify(FICHES[lab] || unsupported()));
    d.crop = d.crop || cropName;
    d.certainty = conf >= 0.6 && pre ? 'prob' : 'hyp';
    if (d.status === 'ok' && conf < 0.6) d.status = 'watch';
    d.confidence = Math.round(conf * 100);
    return d;
  }
  return { load, diagnose, CROP_PREFIX };
})();
