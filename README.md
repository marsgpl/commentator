# Commentator

[Аборт](https://eki.one/cmnt/abortion/ru/)

[Эффект Пандоры](https://eki.one/cmnt/pandora/ru/)

[Смертная казнь](https://eki.one/cmnt/deathpen/ru/)

[Беспорядки в США](https://eki.one/cmnt/usaprotests/ru/)

## how to add new topic

1. stop api
2. create mongodb indexes for it
3. add new collection name to AVAILABLE_COLLECTIONS in constants.dart
4. start api
5. add translations (title, subtitle, api_commentator_id, )
6. alter widget dev build script
7. alter widget prod build script (do it yourself here:)
8. compile widget
