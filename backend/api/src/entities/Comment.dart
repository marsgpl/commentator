import 'package:uuid/uuid.dart';

import '../renamer.dart';

class Comment implements Comparable<Comment> {
    Comment({
        String id,
        DateTime createdAt,
        this.text = '',
        this.side = '',
        this.name = '',
        this.ip = '',
        this.userAgent = '',
        this.cfUid = '',
        this.appUserToken = '',
        this.likes = 0,
        this.likedByMe = false,
    }) :
        id = id ?? Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

    final String id;
    final DateTime createdAt;
    String text;
    String side;
    String name;
    String ip;
    String userAgent;
    String cfUid;
    String appUserToken;
    int likes;
    bool likedByMe;

    @override
    String toString() => '*Comment(id: $id)';

    @override
    int compareTo(Comment other) {
        return createdAt.compareTo(other.createdAt);
    }

    Comment.fromMongo(Map<String, dynamic> mongoData) :
        id = mongoData['_id'].toHexString() ?? Uuid().v4(),
        createdAt = mongoData['createdAt'] ?? DateTime.now(),
        text = mongoData['text'] ?? '',
        side = mongoData['side'] ?? '',
        name = mongoData['name'] ?? '',
        ip = mongoData['ip'] ?? '',
        userAgent = mongoData['userAgent'] ?? '',
        cfUid = mongoData['cfUid'] ?? '',
        appUserToken = mongoData['appUserToken'] ?? '',
        likes = mongoData['likes'] ?? 0,
        likedByMe = false;

    Map<String, dynamic> toMongo() => {
        'createdAt': createdAt,
        'text': text,
        'side': side,
        'name': name,
        'ip': ip,
        'userAgent': userAgent,
        'cfUid': cfUid,
        'appUserToken': appUserToken,
        'likes': likes,
    };

    Map<String, dynamic> toJson() {
        Map<String, dynamic> json = {
            renamer('id'): id,
            renamer('createdAt'): createdAt.toIso8601String(),
            renamer('text'): text,
            renamer('side'): side,
        };

        if (name.length > 0) {
            json[renamer('name')] = name;
        }

        if (likes > 0) {
            json[renamer('likes')] = likes;
        }

        if (likedByMe) {
            json[renamer('likedByMe')] = 1;
        }

        return json;
    }
}
