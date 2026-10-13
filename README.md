# Numrow Video Seek Guard

*[Read this in English](README.en.md)*

Une extension Firefox qui empêche la rangée des chiffres d'un clavier AZERTY de faire sauter vos vidéos.

Sur un clavier AZERTY, les touches de la rangée des chiffres tapent des symboles (`& é " ' ( § è ! ç à`) tant que Maj n'est pas enfoncée. De nombreux lecteurs vidéo n'en tiennent pas compte et y voient des raccourcis « aller à 10 %, 20 %, … » : une touche effleurée par erreur, et vous perdez le fil de votre vidéo. Cette extension bloque ces sauts accidentels.

## Installation

<!-- TODO : à la publication, remplacer la ligne « Bientôt disponible » par le lien vers la fiche, en vérifiant l'adresse :
**[Installer Numrow Video Seek Guard pour Firefox](https://addons.mozilla.org/firefox/addon/numrow-video-seek-guard/)** -->
**Bientôt disponible sur le catalogue des modules complémentaires de Firefox.**

L'installation se fera en un clic, sans rien à configurer. En attendant, vous pouvez essayer l'extension en la [lançant depuis les sources](#lancer-depuis-les-sources).

L'extension n'existe que pour Firefox sur ordinateur, à partir de la version 140. Elle n'est disponible ni pour les autres navigateurs, ni pour Firefox pour Android.

## Ce qui change

- Appuyer sur une touche de la rangée des chiffres sans Maj ne fait plus sauter la vidéo.
- Maj + chiffre tape toujours un vrai chiffre : les raccourcis de saut du lecteur restent donc disponibles quand vous en avez besoin.
- La saisie dans les champs de texte, le pavé numérique et les raccourcis du navigateur comme Ctrl+1 fonctionnent comme d'habitude.
- Les pages sans lecteur vidéo ou audio ne sont pas affectées.
- Les appels vidéo, les bureaux à distance et les jeux qui capturent la souris ne le sont pas non plus, bien qu'ils utilisent de la vidéo ou du son.

## Vie privée

L'extension ne collecte aucune donnée et n'effectue aucune requête réseau. Firefox demande l'accès à tous les sites web uniquement parce qu'un lecteur vidéo peut se trouver sur n'importe quelle page.

## Lancer depuis les sources

Ouvrez `about:debugging#/runtime/this-firefox` dans Firefox, cliquez sur **Charger un module complémentaire temporaire…** puis sélectionnez `manifest.json`. Aucune compilation n'est nécessaire.

## Licence

[MIT](LICENSE)
