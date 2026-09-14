enum NoticePriority { low, medium, high, urgent }

class AgrarianNotice {
  final String id;
  final String title;
  final String department;
  final String issuedBy;
  final String description;
  final DateTime date;
  final NoticePriority priority;
  final String category; // 'Subsidy', 'Weather Warning', 'Disease Alert', 'Crop Directive'
  final bool isOfficial;

  AgrarianNotice({
    required this.id,
    required this.title,
    required this.department,
    required this.issuedBy,
    required this.description,
    required this.date,
    this.priority = NoticePriority.medium,
    required this.category,
    this.isOfficial = true,
  });
}
