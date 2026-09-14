import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/app_state_provider.dart';
import '../buyer/buyer_main_nav.dart';
import 'login_screen.dart';

class BuyerRegistrationScreen extends StatefulWidget {
  const BuyerRegistrationScreen({super.key});

  @override
  State<BuyerRegistrationScreen> createState() => _BuyerRegistrationScreenState();
}

class _BuyerRegistrationScreenState extends State<BuyerRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _businessNameController = TextEditingController(text: 'Green Leaf Caterings');
  final _contactPersonController = TextEditingController(text: 'Niroshan Perera');
  final _nicController = TextEditingController(text: '198812345678');
  final _phoneController = TextEditingController(text: '77 123 4567');
  final _deliveryAddressController = TextEditingController(text: 'No. 42, Temple Road, Bandarawela, 90100');

  String? _selectedCategory = 'Event Catering';
  bool _agreedToTerms = true;
  bool _isLoading = false;

  final List<String> _categories = [
    'Event Catering',
    'Hotel & Resort Restaurant',
    'Wholesale Bulk Distributor',
    'Local Retail Vendor',
    'Institutional Canteen',
    'Bakery & Food Processing',
  ];

  @override
  void dispose() {
    _businessNameController.dispose();
    _contactPersonController.dispose();
    _nicController.dispose();
    _phoneController.dispose();
    _deliveryAddressController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please agree to the Terms of Service & Privacy Policy to continue.'),
          backgroundColor: AppColors.riskModerate,
        ),
      );
      return;
    }

    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;

      final appState = Provider.of<AppStateProvider>(context, listen: false);
      appState.registerBuyer(
        businessName: _businessNameController.text.trim(),
        ownerName: _contactPersonController.text.trim(),
        phone: '+94 ${_phoneController.text.trim()}',
        category: _selectedCategory ?? 'Event Catering',
        address: _deliveryAddressController.text.trim(),
        weeklyCapacityKg: 1200.0,
      );

      setState(() => _isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Buyer Account Created! Welcome to Asvanna Zero-Waste Marketplace.'),
          backgroundColor: AppColors.asvannaDarkGreen,
          behavior: SnackBarBehavior.floating,
        ),
      );

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const BuyerMainNav()),
        (route) => false,
      );
    }
  }

  void _showTermsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Terms of Service & Sourcing Policy', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Text(
            '1. Direct Farmgate Sourcing: Buyers registered on Asvanna agree to purchase verified surplus crops directly from local farmers within the designated 5km radius.\n\n'
            '2. Fair Pricing Commitment: Transactions adhere to transparent benchmarked pricing to eliminate intermediate waste.\n\n'
            '3. Quality Assurance: Produce grades and inspection must follow agrarian guidelines.\n\n'
            '4. Privacy: Contact and location details are shared solely for order fulfillment.',
            style: GoogleFonts.inter(fontSize: 13, height: 1.45, color: AppColors.textSecondary),
          ),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.asvannaButtonGreen),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('I Understand'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 22.0, vertical: 16.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Top Back Button
                    Align(
                      alignment: Alignment.centerLeft,
                      child: InkWell(
                        onTap: () {
                          if (Navigator.canPop(context)) {
                            Navigator.pop(context);
                          } else {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.buyer)),
                            );
                          }
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 2.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.arrow_back,
                                size: 18,
                                color: AppColors.asvannaDarkGreen,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Back',
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.asvannaDarkGreen,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Header
                    Text(
                      'Become a Local Buyer',
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF132B1E),
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Fill in your business details to start sourcing.',
                      style: GoogleFonts.inter(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w400,
                        color: const Color(0xFF556955),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Business Name
                    Text(
                      'Business Name',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _businessNameController,
                      style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                      decoration: InputDecoration(
                        hintText: 'e.g. Green Leaf Caterings',
                        hintStyle: GoogleFonts.inter(fontSize: 13.5, color: const Color(0xFF90A395)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        filled: true,
                        fillColor: Colors.white,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.asvannaBorder, width: 1.2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.asvannaDarkGreen, width: 1.8),
                        ),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Please enter business name' : null,
                    ),
                    const SizedBox(height: 16),

                    // Buyer Category Dropdown
                    Text(
                      'Buyer Category',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _selectedCategory,
                      isExpanded: true,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF556955)),
                      style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        filled: true,
                        fillColor: Colors.white,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.asvannaBorder, width: 1.2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.asvannaDarkGreen, width: 1.8),
                        ),
                      ),
                      hint: Text('Select category', style: GoogleFonts.inter(color: const Color(0xFF90A395), fontSize: 13.5)),
                      items: _categories.map((cat) {
                        return DropdownMenuItem(value: cat, child: Text(cat));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedCategory = val);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Two Column Row: Contact Person Name & NIC Number
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Contact Person Name
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Contact Person Name',
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1A3828),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _contactPersonController,
                                style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                                decoration: InputDecoration(
                                  hintText: 'Full Name',
                                  hintStyle: GoogleFonts.inter(fontSize: 13.5, color: const Color(0xFF90A395)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                  filled: true,
                                  fillColor: Colors.white,
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(color: AppColors.asvannaBorder, width: 1.2),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(color: AppColors.asvannaDarkGreen, width: 1.8),
                                  ),
                                ),
                                validator: (v) => v == null || v.trim().isEmpty ? 'Enter name' : null,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 14),
                        // NIC Number
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'NIC Number',
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1A3828),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _nicController,
                                style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                                decoration: InputDecoration(
                                  hintText: 'V / JX',
                                  hintStyle: GoogleFonts.inter(fontSize: 13.5, color: const Color(0xFF90A395)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                                  filled: true,
                                  fillColor: Colors.white,
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(color: AppColors.asvannaBorder, width: 1.2),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(color: AppColors.asvannaDarkGreen, width: 1.8),
                                  ),
                                ),
                                validator: (v) => v == null || v.trim().isEmpty ? 'Enter NIC' : null,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Mobile Phone Number with +94 Prefix
                    Text(
                      'Mobile Phone Number',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.asvannaBorder, width: 1.2),
                      ),
                      child: Row(
                        children: [
                          // +94 Prefix Box
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: const BoxDecoration(
                              color: AppColors.asvannaPrefixBg,
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(9),
                                bottomLeft: Radius.circular(9),
                              ),
                              border: Border(
                                right: BorderSide(color: AppColors.asvannaBorder, width: 1.2),
                              ),
                            ),
                            child: Text(
                              '+94',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF2C3E32),
                              ),
                            ),
                          ),
                          // Phone Number Input
                          Expanded(
                            child: TextFormField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                              decoration: InputDecoration(
                                hintText: '77 123 4567',
                                hintStyle: GoogleFonts.inter(fontSize: 13.5, color: const Color(0xFF90A395)),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                              ),
                              validator: (v) => v == null || v.trim().isEmpty ? 'Enter phone number' : null,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Delivery Address
                    Text(
                      'Delivery Address',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _deliveryAddressController,
                      maxLines: 3,
                      style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                      decoration: InputDecoration(
                        hintText: 'Street, City, Postal Code',
                        hintStyle: GoogleFonts.inter(fontSize: 13.5, color: const Color(0xFF90A395)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        filled: true,
                        fillColor: Colors.white,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.asvannaBorder, width: 1.2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.asvannaDarkGreen, width: 1.8),
                        ),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Please enter delivery address' : null,
                    ),
                    const SizedBox(height: 16),

                    // Terms & Privacy Checkbox
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _agreedToTerms,
                            activeColor: AppColors.asvannaDarkGreen,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            side: const BorderSide(color: Color(0xFFB5C4B5), width: 1.5),
                            onChanged: (val) {
                              setState(() => _agreedToTerms = val ?? false);
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: RichText(
                            text: TextSpan(
                              text: 'I agree to the ',
                              style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF4C6152), height: 1.35),
                              children: [
                                WidgetSpan(
                                  child: GestureDetector(
                                    onTap: _showTermsDialog,
                                    child: Text(
                                      'Terms of Service',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.asvannaDarkGreen,
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                  ),
                                ),
                                const TextSpan(text: ' and '),
                                WidgetSpan(
                                  child: GestureDetector(
                                    onTap: _showTermsDialog,
                                    child: Text(
                                      'Privacy Policy',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.asvannaDarkGreen,
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                  ),
                                ),
                                const TextSpan(text: ' regarding local business sourcing.'),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Create Buyer Account Button
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.asvannaButtonGreen,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Create Buyer Account',
                                  style: GoogleFonts.inter(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(Icons.person_add_alt_1_rounded, size: 18, color: Colors.white),
                              ],
                            ),
                    ),
                    const SizedBox(height: 24),

                    // Divider
                    const Divider(color: Color(0xFFE5ECE5), thickness: 1),
                    const SizedBox(height: 16),

                    // Already have an account? Log in here
                    Center(
                      child: GestureDetector(
                        onTap: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.buyer)),
                          );
                        },
                        child: RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            text: 'Already have an account? ',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: const Color(0xFF556955),
                            ),
                            children: [
                              TextSpan(
                                text: 'Log in here',
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.asvannaDarkGreen,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
