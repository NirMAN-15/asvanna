import 'package:flutter/material.dart';
import '../../../core/models/crop_model.dart';
import 'crop_status_screen.dart';

class PrePlantingRiskScreen extends StatelessWidget {
  final Crop? initialCrop;

  const PrePlantingRiskScreen({super.key, this.initialCrop});

  @override
  Widget build(BuildContext context) {
    return CropStatusScreen(initialCrop: initialCrop);
  }
}
