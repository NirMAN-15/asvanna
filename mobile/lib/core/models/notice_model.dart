enum NoticePriority { low, medium, high, urgent }

class AgrarianNotice {
  final String id;
  final String title;
  final String? titleEn;
  final String? titleSi;
  final String? titleTa;
  final String department;
  final String issuedBy;
  final String description;
  final String? descriptionEn;
  final String? descriptionSi;
  final String? descriptionTa;
  final DateTime date;
  final NoticePriority priority;
  final String category; // 'Subsidy', 'Weather Warning', 'Disease Alert', 'Crop Directive'
  final bool isOfficial;

  AgrarianNotice({
    required this.id,
    required this.title,
    this.titleEn,
    this.titleSi,
    this.titleTa,
    required this.department,
    required this.issuedBy,
    required this.description,
    this.descriptionEn,
    this.descriptionSi,
    this.descriptionTa,
    required this.date,
    this.priority = NoticePriority.medium,
    required this.category,
    this.isOfficial = true,
  });

  factory AgrarianNotice.fromJson(Map<String, dynamic> json, {String lang = 'en'}) {
    // Determine priority from string or enum
    final priorityStr = (json['priority'] ?? json['severity'] ?? 'medium').toString().toLowerCase();
    NoticePriority priority = NoticePriority.medium;
    if (priorityStr.contains('urgent') || priorityStr.contains('critical')) {
      priority = NoticePriority.urgent;
    } else if (priorityStr.contains('high')) {
      priority = NoticePriority.high;
    } else if (priorityStr.contains('low') || priorityStr.contains('safe')) {
      priority = NoticePriority.low;
    }

    // Resolve date
    DateTime noticeDate = DateTime.now();
    if (json['date'] != null) {
      noticeDate = DateTime.tryParse(json['date'].toString()) ?? DateTime.now();
    } else if (json['created_at'] != null) {
      noticeDate = DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now();
    } else if (json['attempted_at'] != null) {
      noticeDate = DateTime.tryParse(json['attempted_at'].toString()) ?? DateTime.now();
    }

    // Resolve localized title
    String title = json['title']?.toString() ?? json['title_en']?.toString() ?? 'Agrarian Notice';
    if (lang == 'si' && json['title_si'] != null) {
      title = json['title_si'].toString();
    } else if (lang == 'ta' && json['title_ta'] != null) {
      title = json['title_ta'].toString();
    } else if (lang == 'en' && json['title_en'] != null) {
      title = json['title_en'].toString();
    }

    // Resolve localized description
    String description = json['description']?.toString() ?? json['description_en']?.toString() ?? json['message_en']?.toString() ?? json['body']?.toString() ?? '';
    if (lang == 'si' && (json['description_si'] != null || json['message_si'] != null)) {
      description = (json['description_si'] ?? json['message_si']).toString();
    } else if (lang == 'ta' && (json['description_ta'] != null || json['message_ta'] != null)) {
      description = (json['description_ta'] ?? json['message_ta']).toString();
    } else if (lang == 'en' && (json['description_en'] != null || json['message_en'] != null)) {
      description = (json['description_en'] ?? json['message_en']).toString();
    }

    return AgrarianNotice(
      id: json['id']?.toString() ?? 'notice_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      titleEn: json['title_en']?.toString(),
      titleSi: json['title_si']?.toString(),
      titleTa: json['title_ta']?.toString(),
      department: json['department']?.toString() ?? 'Department of Agrarian Development',
      issuedBy: json['issuedBy']?.toString() ?? json['issued_by']?.toString() ?? 'Agrarian Services Centre',
      description: description,
      descriptionEn: json['description_en']?.toString() ?? json['message_en']?.toString(),
      descriptionSi: json['description_si']?.toString() ?? json['message_si']?.toString(),
      descriptionTa: json['description_ta']?.toString() ?? json['message_ta']?.toString(),
      date: noticeDate,
      priority: priority,
      category: json['category']?.toString() ?? 'Crop Directive',
      isOfficial: json['isOfficial'] != false && json['is_official'] != false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'title_en': titleEn ?? title,
    'title_si': titleSi,
    'title_ta': titleTa,
    'department': department,
    'issued_by': issuedBy,
    'description': description,
    'description_en': descriptionEn ?? description,
    'description_si': descriptionSi,
    'description_ta': descriptionTa,
    'date': date.toIso8601String(),
    'priority': priority.name,
    'category': category,
    'is_official': isOfficial,
  };
}

class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type; // 'BROADCAST', 'SYSTEM', 'MARKET', 'RISK'
  final String status; // 'DELIVERED', 'READ'
  final DateTime timestamp;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.status,
    required this.timestamp,
  });

  bool get isRead => status == 'READ';

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    DateTime ts = DateTime.now();
    if (json['attempted_at'] != null) {
      ts = DateTime.tryParse(json['attempted_at'].toString()) ?? DateTime.now();
    } else if (json['created_at'] != null) {
      ts = DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now();
    }

    return AppNotification(
      id: json['id']?.toString() ?? 'notif_${DateTime.now().millisecondsSinceEpoch}',
      title: json['title']?.toString() ?? 'Notification',
      body: json['body']?.toString() ?? json['description']?.toString() ?? '',
      type: json['notification_type']?.toString() ?? json['type']?.toString() ?? 'SYSTEM',
      status: json['status']?.toString() ?? 'DELIVERED',
      timestamp: ts,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'body': body,
    'notification_type': type,
    'status': status,
    'attempted_at': timestamp.toIso8601String(),
  };
}
