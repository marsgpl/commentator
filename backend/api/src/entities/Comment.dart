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

    @override
    String toString() => '*Comment(id: $id)';

    @override
    int compareTo(Comment other) {
        return createdAt.compareTo(other.createdAt);
    }

    Comment.fromMongo(Map<String, dynamic> mongoData) :
        id = mongoData['_id'].toHexString() ?? Uuid().v4(),
        createdAt = mongoData['createdAt'] ?? DateTime.now().toString(),
        text = mongoData['text'] ?? '',
        side = mongoData['side'] ?? '',
        name = mongoData['name'] ?? '',
        ip = mongoData['ip'] ?? '',
        userAgent = mongoData['userAgent'] ?? '',
        cfUid = mongoData['cfUid'] ?? '';

    Map<String, dynamic> toMongo() => {
        // id
        'createdAt': createdAt,
        'text': text,
        'side': side,
        'name': name,
        'ip': ip,
        'userAgent': userAgent,
        'cfUid': cfUid,
    };

    Map<String, dynamic> toJson() => {
        renamer('id'): id,
        renamer('createdAt'): createdAt.toString(),
        renamer('text'): text,
        renamer('side'): side,
        renamer('name'): name,
        // ip
        // userAgent
        // cfUid
    };
}
