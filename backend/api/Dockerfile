FROM google/dart:2.12

WORKDIR /commentator/api

ENV TZ=Etc/UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN pub global activate dartman

ADD pubspec.yaml .
ADD pubspec.lock .
ADD src .
RUN pub get

CMD dartman src/api.dart
