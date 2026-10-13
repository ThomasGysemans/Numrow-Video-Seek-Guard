# Numrow Video Seek Guard

*[Read this in English](README.en.md)*

Une extension Firefox qui empêche la rangée des chiffres d'un clavier AZERTY de faire sauter vos vidéos.

Sur un clavier AZERTY, les touches de la rangée des chiffres tapent des symboles (`& é " ' ( § è ! ç à`) tant que Maj n'est pas enfoncée. De nombreux lecteurs vidéo n'en tiennent pas compte et y voient des raccourcis « aller à 10 %, 20 %, … » : une touche effleurée par erreur, et vous perdez le fil de votre vidéo. Cette extension bloque ces sauts accidentels.

## Installation

<!-- TODO : confirmer cette URL une fois l'extension publiée sur addons.mozilla.org -->
**[Installer Numrow Video Seek Guard pour Firefox](https://addons.mozilla.org/firefox/addon/numrow-video-seek-guard/)**

Cliquez sur **Ajouter à Firefox**, et c'est tout : il n'y a rien à configurer. Firefox 140 ou une version ultérieure est nécessaire.

## Ce qui change

- Appuyer sur une touche de la rangée des chiffres sans Maj ne fait plus sauter la vidéo.
- Maj + chiffre tape toujours un vrai chiffre : les raccourcis de saut du lecteur restent donc disponibles quand vous en avez besoin.
- La saisie dans les champs de texte, le pavé numérique et les raccourcis du navigateur comme Ctrl+1 fonctionnent comme d'habitude.
- Les pages sans lecteur vidéo ou audio ne sont pas affectées.

## Vie privée

L'extension ne collecte aucune donnée et n'effectue aucune requête réseau. Firefox demande l'accès à tous les sites web uniquement parce qu'un lecteur vidéo peut se trouver sur n'importe quelle page.

## Lancer depuis les sources

Ouvrez `about:debugging#/runtime/this-firefox` dans Firefox, cliquez sur **Charger un module complémentaire temporaire…** puis sélectionnez `manifest.json`. Aucune compilation n'est nécessaire.

## Licence

[MIT](LICENSE)
