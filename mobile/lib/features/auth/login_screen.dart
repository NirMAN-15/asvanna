import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_state_provider.dart';
import 'farmer_registration_screen.dart';
import 'buyer_registration_screen.dart';
import '../farmer/farmer_main_nav.dart';
import '../buyer/buyer_main_nav.dart';

class LoginScreen extends StatefulWidget {
  final UserRole initialRole;

  const LoginScreen({
    super.key,
    this.initialRole = UserRole.farmer,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneOrNicController = TextEditingController(text: '0712345678');
  final _passwordController = TextEditingController(text: 'password123');

  late UserRole _selectedRole;
  bool _obscurePassword = true;
  bool _rememberSession = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole == UserRole.unauthenticated
        ? UserRole.farmer
        : widget.initialRole;
  }

  @override
  void dispose() {
    _phoneOrNicController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignIn() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(milliseconds: 600));
      if (!mounted) return;

      final appState = Provider.of<AppStateProvider>(context, listen: false);
      appState.login(
        identifier: _phoneOrNicController.text.trim(),
        password: _passwordController.text,
        role: _selectedRole,
        rememberSession: _rememberSession,
      );

      setState(() => _isLoading = false);

      _navigateToRoleNav(_selectedRole);
    }
  }

  void _navigateToRoleNav(UserRole role) {
    Widget destination;
    switch (role) {
      case UserRole.farmer:
        destination = const FarmerMainNav();
        break;
      case UserRole.buyer:
        destination = const BuyerMainNav();
        break;
      default:
        destination = const FarmerMainNav();
    }

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => destination),
      (route) => false,
    );
  }

  void _navigateToRegistration() {
    Widget registrationScreen;
    switch (_selectedRole) {
      case UserRole.buyer:
        registrationScreen = const BuyerRegistrationScreen();
        break;
      case UserRole.farmer:
      default:
        registrationScreen = const FarmerRegistrationScreen();
        break;
    }

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => registrationScreen),
    );
  }

  void _showForgotPasswordDialog() {
    final resetController = TextEditingController(text: _phoneOrNicController.text);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.asvannaLightGreen.withOpacity(0.5),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.lock_reset, color: AppColors.asvannaDarkGreen),
            ),
            const SizedBox(width: 10),
            Text(
              'Reset Password',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your registered Phone Number or NIC. We will send a secure verification code to reset your password.',
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: resetController,
              decoration: InputDecoration(
                labelText: 'Phone Number or NIC',
                prefixIcon: const Icon(Icons.phone_android_outlined, size: 20),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.asvannaBorder),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.inter(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.asvannaButtonGreen,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Password reset instructions sent to ${resetController.text.isEmpty ? "your phone" : resetController.text} via SMS.'),
                  backgroundColor: AppColors.asvannaDarkGreen,
                  behavior: SnackBarBehavior.floating,
                ),
              );
            },
            child: const Text('Send Reset Code'),
          ),
        ],
      ),
    );
  }

  void _showContactSupportDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.headset_mic_rounded, color: AppColors.asvannaDarkGreen, size: 26),
                const SizedBox(width: 10),
                Text(
                  'Asvanna Help & Support',
                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _SupportItem(
              icon: Icons.phone_in_talk,
              title: 'Agrarian Services Hotline',
              subtitle: '1920 (Toll Free, Sinhala & Tamil)',
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling Agrarian Hotline 1920...')),
                );
              },
            ),
            const SizedBox(height: 12),
            _SupportItem(
              icon: Icons.location_city,
              title: 'Bandarawela Division Office',
              subtitle: '057-2222123 (Mon-Fri 8:30 AM - 4:15 PM)',
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Calling Bandarawela Agrarian Office...')),
                );
              },
            ),
            const SizedBox(height: 12),
            _SupportItem(
              icon: Icons.email_outlined,
              title: 'Email Support',
              subtitle: 'support@asvanna.gov.lk',
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Opening email client to support@asvanna.gov.lk...')),
                );
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return Scaffold(
      backgroundColor: context.scaffoldBg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 440),
              decoration: BoxDecoration(
                color: context.cardBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: context.cardBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isDark ? 0.3 : 0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 22.0, vertical: 26.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Logo & Header
                    Center(
                      child: Container(
                        width: 76,
                        height: 76,
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDark ? const Color(0xFF0F172A) : Colors.black,
                          border: Border.all(color: AppColors.asvannaButtonGreen, width: 2.5),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.asvannaButtonGreen.withOpacity(0.25),
                              blurRadius: 14,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            'assets/images/aswanna_logo.png',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Center(
                                child: Icon(Icons.eco, color: Colors.greenAccent, size: 40),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                    Text(
                      'ASVANNA',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Unified Access Portal for Agricultural Stakeholders',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: context.subText,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Role Selector Pill Container
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F172A) : AppColors.asvannaPillBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.cardBorder),
                      ),
                      child: Row(
                        children: [
                          _buildRoleTab(
                            role: UserRole.farmer,
                            label: 'Farmer',
                            icon: Icons.person_outline_rounded,
                            isDark: isDark,
                          ),
                          _buildRoleTab(
                            role: UserRole.buyer,
                            label: 'Local Buyer',
                            icon: Icons.shopping_cart_outlined,
                            isDark: isDark,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 22),

                    // Field 1: Phone Number or NIC
                    Text(
                      'Phone Number or NIC',
                      style: GoogleFonts.inter(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: context.titleText,
                      ),
                    ),
                    const SizedBox(height: 7),
                    TextFormField(
                      controller: _phoneOrNicController,
                      keyboardType: TextInputType.text,
                      style: GoogleFonts.inter(
                        fontSize: 14.5,
                        color: context.titleText,
                        fontWeight: FontWeight.w500,
                      ),
                      decoration: InputDecoration(
                        hintText: 'e.g. 0712345678 or 199012345678',
                        hintStyle: GoogleFonts.inter(
                          fontSize: 13.5,
                          color: isDark ? const Color(0xFF64748B) : const Color(0xFF90A395),
                        ),
                        prefixIcon: Icon(
                          Icons.phone_android_outlined,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF6F8274),
                          size: 20,
                        ),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: context.cardBorder, width: 1.2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen, width: 1.8),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.riskCritical, width: 1.2),
                        ),
                        focusedErrorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.riskCritical, width: 1.8),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter your phone number or NIC';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Field 2: Password
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Password',
                          style: GoogleFonts.inter(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: context.titleText,
                          ),
                        ),
                        GestureDetector(
                          onTap: _showForgotPasswordDialog,
                          child: Text(
                            'Forgot?',
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 7),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: GoogleFonts.inter(
                        fontSize: 14.5,
                        color: context.titleText,
                        fontWeight: FontWeight.w500,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Enter your password',
                        hintStyle: GoogleFonts.inter(
                          fontSize: 13.5,
                          color: isDark ? const Color(0xFF64748B) : const Color(0xFF90A395),
                        ),
                        prefixIcon: Icon(
                          Icons.lock_outline_rounded,
                          color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF6F8274),
                          size: 20,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF6F8274),
                            size: 20,
                          ),
                          onPressed: () {
                            setState(() => _obscurePassword = !_obscurePassword);
                          },
                        ),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: context.cardBorder, width: 1.2),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen, width: 1.8),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.riskCritical, width: 1.2),
                        ),
                        focusedErrorBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: AppColors.riskCritical, width: 1.8),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),

                    // Remember session Checkbox
                    Row(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _rememberSession,
                            activeColor: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            side: BorderSide(color: isDark ? const Color(0xFF475569) : const Color(0xFFB5C4B5), width: 1.5),
                            onChanged: (val) {
                              setState(() => _rememberSession = val ?? true);
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() => _rememberSession = !_rememberSession);
                            },
                            child: Text(
                              'Remember session (8 Hours)',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: context.subText,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Sign In Button
                    ElevatedButton(
                      onPressed: _isLoading ? null : _handleSignIn,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.asvannaButtonGreen,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
                                  'Sign In',
                                  style: GoogleFonts.inter(
                                    fontSize: 15.5,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(Icons.login_rounded, size: 18, color: Colors.white),
                              ],
                            ),
                    ),
                    const SizedBox(height: 24),

                    // Support Help Link
                    Center(
                      child: GestureDetector(
                        onTap: _showContactSupportDialog,
                        child: RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            text: 'Need help accessing your account? ',
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              color: context.subText,
                            ),
                            children: [
                              TextSpan(
                                text: 'Contact Support',
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Link to Register
                    Center(
                      child: GestureDetector(
                        onTap: _navigateToRegistration,
                        child: RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            text: "Don't have an account? ",
                            style: GoogleFonts.inter(
                              fontSize: 12.5,
                              color: context.subText,
                            ),
                            children: [
                              TextSpan(
                                text: _getRegisterButtonText(),
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.asvannaButtonGreen,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _getRegisterButtonText() {
    switch (_selectedRole) {
      case UserRole.buyer:
        return 'Register as Buyer';
      case UserRole.farmer:
      default:
        return 'Register as Farmer';
    }
  }

  Widget _buildRoleTab({
    required UserRole role,
    required String label,
    required IconData icon,
    required bool isDark,
  }) {
    final isSelected = _selectedRole == role;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedRole = role;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark ? const Color(0xFF143E23) : AppColors.asvannaLightGreen)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 19,
                color: isSelected
                    ? (isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen)
                    : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF6B7E70)),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected
                      ? (isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen)
                      : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF4C6152)),
                  height: 1.15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SupportItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SupportItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF4F7F4),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: context.cardBorder),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: isDark ? AppColors.darkEmerald : AppColors.asvannaDarkGreen, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: context.titleText,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: context.subText,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, size: 14, color: isDark ? const Color(0xFF64748B) : const Color(0xFF8B9E90)),
          ],
        ),
      ),
    );
  }
}
