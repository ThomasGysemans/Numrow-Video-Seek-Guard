# Numrow Video Seek Guard

*[Read this in English](README.en.md)*

Une extension pour Firefox, Chrome et les autres navigateurs basés sur Chromium qui empêche la rangée des chiffres de votre clavier de faire sauter vos vidéos.

De nombreux lecteurs vidéo traitent les touches de la rangée des chiffres comme des raccourcis « aller à 10 %, 20 %, … » : une touche effleurée par erreur, et vous perdez le fil de votre vidéo. Cela arrive avec toutes les dispositions de clavier, et surprend encore plus sur celles où ces touches tapent des symboles plutôt que des chiffres, comme l'AZERTY (`& é " ' ( § è ! ç à`). Cette extension bloque ces sauts accidentels. Les sauts volontaires restent possibles : il suffit de maintenir Maj en appuyant sur la touche.

## Installation

<!-- TODO : à la publication, remplacer la ligne « Bientôt disponible » par les liens vers les fiches, en vérifiant les adresses :
**[Installer Numrow Video Seek Guard pour Firefox](https://addons.mozilla.org/firefox/addon/numrow-video-seek-guard/)**
**[Installer Numrow Video Seek Guard pour Chrome](https://chromewebstore.google.com/detail/<identifiant de l'extension>)** -->
**Bientôt disponible sur le catalogue des modules complémentaires de Firefox et sur le Chrome Web Store.**

L'installation se fera en un clic, sans rien à configurer. En attendant, vous pouvez essayer l'extension en la [lançant depuis les sources](#lancer-depuis-les-sources).

L'extension fonctionne sur ordinateur, avec Firefox à partir de la version 140, et avec Chrome comme avec les autres navigateurs basés sur Chromium (Edge, Opera, Brave…), qui peuvent l'installer depuis le Chrome Web Store. Elle n'est pas disponible pour Firefox pour Android.

## Ce qui change

- Appuyer sur une touche de la rangée des chiffres ne fait plus sauter la vidéo, quelle que soit la disposition de votre clavier.
- En maintenant Maj, l'extension laisse passer la touche : le raccourci du lecteur reste disponible quand vous le voulez vraiment.
- La saisie dans les champs de texte, le pavé numérique et les raccourcis du navigateur comme Ctrl+1 fonctionnent comme d'habitude.
- Les pages sans lecteur vidéo ou audio ne sont pas affectées.
- Les appels vidéo, les bureaux à distance et les jeux qui capturent la souris ne le sont pas non plus, bien qu'ils utilisent de la vidéo ou du son.

## Vie privée

L'extension ne collecte aucune donnée et n'effectue aucune requête réseau. Le navigateur demande l'accès à tous les sites web uniquement parce qu'un lecteur vidéo peut se trouver sur n'importe quelle page.

## Lancer depuis les sources

Dans Firefox, aucune compilation n'est nécessaire : ouvrez `about:debugging#/runtime/this-firefox`, cliquez sur **Charger un module complémentaire temporaire…** puis sélectionnez `manifest.json`.

Pour Chrome ou un autre navigateur basé sur Chromium, il faut d'abord construire l'extension, avec Node.js 22 ou plus récent : lancez `npm install` puis `npm run build:chromium`. Ouvrez ensuite `chrome://extensions`, activez le **Mode développeur**, cliquez sur **Charger l'extension non empaquetée** et sélectionnez le dossier `web-ext-artifacts/chromium`.

## Licence

[MIT](LICENSE)
