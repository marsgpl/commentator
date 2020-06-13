import 'package:uuid/uuid.dart';

import '../renamer.dart';

class Comment implements Comparable<Comment> {
    Comment({
        String id,
        this.text = '',
        this.side = '',
        this.name = '',
        this.ip = '',
        this.userAgent = '',
        this.cfUid = '',
        this.appUserToken = '',
        this.likes = 0,
        this.likedByMe = false,
        this.replies = 0,
    }) :
        id = id ?? Uuid().v4();

    final String id;
    String text;
    String side;
    String name;
    String ip;
    String userAgent;
    String cfUid;
    String appUserToken;
    int likes;
    bool likedByMe;
    int replies;

    @override
    String toString() => '*Comment(id: $id)';

    @override
    int compareTo(Comment other) {
        return id.compareTo(other.id);
    }

    Comment.fromMongo(Map<String, dynamic> mongoData) :
        id = mongoData['_id'].toHexString() ?? Uuid().v4(),
        text = mongoData['text'] ?? '',
        side = mongoData['side'] ?? '',
        name = mongoData['name'] ?? '',
        ip = mongoData['ip'] ?? '',
        userAgent = mongoData['userAgent'] ?? '',
        cfUid = mongoData['cfUid'] ?? '',
        appUserToken = mongoData['appUserToken'] ?? '',
        likes = (mongoData['likes'] ?? 0).round(),
        likedByMe = false,
        replies = (mongoData['replies'] ?? 0).round();

    Map<String, dynamic> toMongo() => {
        'text': text,
        'side': side,
        'name': name,
        'ip': ip,
        'userAgent': userAgent,
        'cfUid': cfUid,
        'appUserToken': appUserToken,
        'likes': likes,
        'replies': replies,
    };

    Map<String, dynamic> toJson() {
        Map<String, dynamic> json = {
            renamer('id'): id,
            renamer('text'): text,
        };

        if (side.length > 0) {
            json[renamer('side')] = side;
        }

        if (name.length > 0) {
            json[renamer('name')] = name;
        }

        if (likes > 0) {
            json[renamer('likes')] = likes;
        }

        if (likedByMe) {
            json[renamer('likedByMe')] = 1;
        }

        if (replies > 0) {
            json[renamer('replies')] = replies;
        }

        return json;
    }
}
