import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/providers/app_state_provider.dart';
import '../farmer/farmer_main_nav.dart';
import 'login_screen.dart';

class FarmerRegistrationScreen extends StatefulWidget {
  const FarmerRegistrationScreen({super.key});

  @override
  State<FarmerRegistrationScreen> createState() => _FarmerRegistrationScreenState();
}

class _FarmerRegistrationScreenState extends State<FarmerRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController(text: 'Imal Lakshitha');
  final _nicController = TextEditingController(text: '200123456789');
  final _phoneController = TextEditingController(text: '77 123 4567');
  final _acresController = TextEditingController(text: '3.5');
  final _locationController = TextEditingController(text: 'Heeloya Road, Bandarawela');

  String _selectedDivision = 'Bandarawela';
  String _selectedGnd = 'Heeloya West (GND 142)';
  bool _agreedToTerms = true;
  bool _isLoading = false;

  final List<String> _divisions = [
    'Bandarawela',
    'Welimada',
    'Nuwara Eliya',
    'Haputale',
    'Badulla',
  ];

  final List<String> _gndList = [
    'Heeloya West (GND 142)',
    'Kinigama (GND 145)',
    'Diyatalawa Central (GND 138)',
    'Bambaragala (GND 149)',
    'Kabillawela North (GND 151)',
  ];

  @override
  void dispose() {
    _fullNameController.dispose();
    _nicController.dispose();
    _phoneController.dispose();
    _acresController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_agreedToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please agree to the Terms of Service & Agrarian Data Sharing policy.'),
          backgroundColor: AppColors.riskModerate,
        ),
      );
      return;
    }

    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;

      final acres = double.tryParse(_acresController.text) ?? 2.0;
      final appState = Provider.of<AppStateProvider>(context, listen: false);

      appState.updateFarmerProfile(
        fullName: _fullNameController.text.trim(),
        phone: '+94 ${_phoneController.text.trim()}',
        nic: _nicController.text.trim(),
        division: _selectedDivision,
        gnd: _selectedGnd,
        totalAcres: acres,
      );

      appState.setRole(UserRole.farmer);
      setState(() => _isLoading = false);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Farmer Account Registered! Welcome to Asvanna.'),
          backgroundColor: AppColors.asvannaDarkGreen,
          behavior: SnackBarBehavior.floating,
        ),
      );

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const FarmerMainNav()),
        (route) => false,
      );
    }
  }

  void _showTermsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Agrarian Terms & Data Sharing', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Text(
            '1. Agrarian Portal Integration: Planting records are integrated with the Department of Agrarian Development for real-time market risk forecasting.\n\n'
            '2. Zero-Waste Marketplace: Listed surplus produce is made available to verified local catering services and restaurants within a 5km radius.\n\n'
            '3. Subsidies & Circulars: Automated notifications regarding fertilizer vouchers and seed allocation will be delivered directly.',
            style: GoogleFonts.inter(fontSize: 13, height: 1.45, color: AppColors.textSecondary),
          ),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.asvannaButtonGreen),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('I Agree'),
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
                              MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.farmer)),
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
                      'Become a Registered Farmer',
                      style: GoogleFonts.poppins(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF132B1E),
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Connect your farm to real-time agrarian data & local buyers.',
                      style: GoogleFonts.inter(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w400,
                        color: const Color(0xFF556955),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Full Name
                    Text(
                      'Full Name',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _fullNameController,
                      style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                      decoration: InputDecoration(
                        hintText: 'e.g. Imal Lakshitha',
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
                      validator: (v) => v == null || v.trim().isEmpty ? 'Please enter your name' : null,
                    ),
                    const SizedBox(height: 16),

                    // Two Column Row: NIC Number & Cultivable Land (Acres)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                                  hintText: 'V / JX / 12-digit',
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
                        const SizedBox(width: 14),
                        // Land Acres
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Farmland (Acres)',
                                style: GoogleFonts.inter(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFF1A3828),
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextFormField(
                                controller: _acresController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                                decoration: InputDecoration(
                                  hintText: 'e.g. 3.5',
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
                                validator: (v) => v == null || v.trim().isEmpty ? 'Enter acres' : null,
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

                    // Agrarian Division Dropdown
                    Text(
                      'Agrarian Services Division',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _selectedDivision,
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
                      items: _divisions.map((div) {
                        return DropdownMenuItem(value: div, child: Text(div));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedDivision = val);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Grama Niladhari Division (GND)
                    Text(
                      'Grama Niladhari Division (GND)',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: _selectedGnd,
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
                      items: _gndList.map((gnd) {
                        return DropdownMenuItem(value: gnd, child: Text(gnd, overflow: TextOverflow.ellipsis));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedGnd = val);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Farm Address
                    Text(
                      'Farm Location Address',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A3828),
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _locationController,
                      style: GoogleFonts.inter(fontSize: 14, color: AppColors.asvannaTextDark),
                      decoration: InputDecoration(
                        hintText: 'e.g. Heeloya Road, Bandarawela',
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
                      validator: (v) => v == null || v.trim().isEmpty ? 'Please enter farm address' : null,
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
                                      'Agrarian Data Sharing Policy',
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.asvannaDarkGreen,
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                  ),
                                ),
                                const TextSpan(text: ' regarding harvest and planting records.'),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Create Farmer Account Button
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
                                  'Create Farmer Account',
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
                            MaterialPageRoute(builder: (_) => const LoginScreen(initialRole: UserRole.farmer)),
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
