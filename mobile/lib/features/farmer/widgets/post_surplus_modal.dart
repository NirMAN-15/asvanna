import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/models/crop_model.dart';
import '../../../core/providers/app_state_provider.dart';

class PostSurplusModal extends StatefulWidget {
  const PostSurplusModal({super.key});

  @override
  State<PostSurplusModal> createState() => _PostSurplusModalState();
}

class _PostSurplusModalState extends State<PostSurplusModal> {
  final _formKey = GlobalKey<FormState>();
  late Crop _selectedCrop;
  final _quantityController = TextEditingController(text: '350');
  final _priceController = TextEditingController(text: '140');
  final _notesController = TextEditingController(text: 'Fresh harvest, washed and graded in 25kg bags.');
  bool _isUrgent = true;

  @override
  void initState() {
    super.initState();
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    _selectedCrop = appState.availableCrops.first;
    _priceController.text = (_selectedCrop.currentMarketPricePerKg * 0.75).toStringAsFixed(0);
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _priceController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final qty = double.tryParse(_quantityController.text) ?? 100.0;
      final price = double.tryParse(_priceController.text) ?? _selectedCrop.currentMarketPricePerKg;
      final appState = Provider.of<AppStateProvider>(context, listen: false);

      appState.addSurplusListing(
        cropName: _selectedCrop.name,
        cropEmoji: _selectedCrop.iconEmoji,
        quantityKg: qty,
        askingPricePerKg: price,
        regularPricePerKg: _selectedCrop.currentMarketPricePerKg,
        isUrgent: _isUrgent,
        notes: _notesController.text.trim(),
      );

      Navigator.pop(context);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${_selectedCrop.name} surplus listed! Local buyers within 5km are being notified.'),
          backgroundColor: AppColors.badgeFresh,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppStateProvider>(context);

    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Post Surplus Produce',
                    style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              Text(
                'Connect directly with event caterers and bulk buyers within a 5km radius.',
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<Crop>(
                value: _selectedCrop,
                decoration: const InputDecoration(labelText: 'Select Crop', prefixIcon: Icon(Icons.eco)),
                items: appState.availableCrops.map((c) {
                  return DropdownMenuItem(
                    value: c,
                    child: Text('${c.iconEmoji} ${c.name} (${c.sinhalaName})'),
                  );
                }).toList(),
                onChanged: (c) {
                  if (c != null) {
                    setState(() {
                      _selectedCrop = c;
                      _priceController.text = (c.currentMarketPricePerKg * 0.75).toStringAsFixed(0);
                    });
                  }
                },
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _quantityController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Surplus Quantity', suffixText: 'Kg'),
                      validator: (v) => v == null || v.isEmpty ? 'Enter quantity' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _priceController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Asking Price', prefixText: 'Rs. ', suffixText: '/Kg'),
                      validator: (v) => v == null || v.isEmpty ? 'Enter price' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('Urgent Perishable Clearance', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                subtitle: const Text('Priority broadcast to local hotels & wedding caterers'),
                value: _isUrgent,
                activeColor: AppColors.riskCritical,
                onChanged: (val) => setState(() => _isUrgent = val),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _notesController,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Condition / Notes for Buyer'),
              ),
              const SizedBox(height: 20),

              ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.badgeHarvest,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Publish to 5km Marketplace', style: TextStyle(fontSize: 15)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
