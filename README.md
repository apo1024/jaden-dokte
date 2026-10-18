# Jaden Doktè

Diagnostic des maladies des plantes à partir d'une photo — **directement sur votre téléphone**, sans compte, sans abonnement et **sans envoyer la photo** sur Internet. Interface en français et en kreyòl ayisyen.

## Ce que fait l'appli
- Photo d'une feuille → état (sain / à surveiller / malade), problème probable, symptômes, gestes immédiats, solutions naturelles, produits possibles (famille et matière active, jamais de marque ni de dose), prévention, quand demander de l'aide.
- 14 cultures reconnues : tomate, maïs, piment/poivron, pomme de terre, orange/citron, courge/giraumon, fraise, raisin, pêche, pomme, cerise, myrtille, framboise, soja (26 maladies + plantes saines).
- Pour les autres cultures (banane, manioc, café, riz…), l'appli le dit honnêtement et donne une liste de vérifications de base.
- Historique gardé dans le téléphone.

Analyse indicative : en cas de doute ou si le problème s'étend, demandez l'avis d'un agronome ou du service agricole (BAC / MARNDR).

## Mise en ligne
Publiez ce dossier avec GitHub Pages (branche `main`, dossier `/`). Le premier usage télécharge le modèle (25 Mo), ensuite il reste en cache.

## Modèle et licences
- Classifieur : « plant-disease-dinov2-small » (rodynaemad, base DINOv2-small, entraîné sur PlantVillage) — **CC BY-SA 4.0** ; version 8 bits `plantes-q8.onnx` dérivée et partagée sous la même licence.
- Exécution : ONNX Runtime Web (MIT), coi-serviceworker (MIT).
- Fiches de soins (`fiches.json`) : rédigées pour cette appli, en français et en kreyòl.
