import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Every file listed in assets/manifest.json must exist, and every file in
/// assets/ must be listed. Regenerate with tool/export_assets.py.
void main() {
  final manifestFile = File('assets/manifest.json');
  final manifest =
      jsonDecode(manifestFile.readAsStringSync()) as Map<String, dynamic>;
  final entries = (manifest['assets'] as List).cast<Map<String, dynamic>>();
  final listed = <String>{
    for (final e in entries) ...(e['files'] as List).cast<String>(),
  };

  test('every file in the manifest exists', () {
    final missing = listed.where((p) => !File(p).existsSync()).toList()..sort();
    expect(missing, isEmpty, reason: 'Missing files:\n${missing.join('\n')}');
  });

  test('every file in assets/ is in the manifest', () {
    final onDisk = Directory('assets')
        .listSync(recursive: true)
        .whereType<File>()
        .map((f) => f.path.replaceAll(r'\', '/'))
        .where((p) => p != 'assets/manifest.json')
        .where((p) => !p.split('/').last.startsWith('.'))
        .toSet();
    final unlisted = onDisk.difference(listed).toList()..sort();
    expect(unlisted, isEmpty, reason: 'Not in manifest:\n${unlisted.join('\n')}');
  });

  test('every entry has a size, modes and screens', () {
    for (final e in entries) {
      final path = e['path'] as String;
      expect(e['modes'], isNotEmpty, reason: path);
      expect(e['screens'], isNotEmpty, reason: path);
      if (path.endsWith('.png')) {
        expect(e['size'], hasLength(2), reason: path);
        final modes = (e['modes'] as List).cast<String>();
        expect(
          modes.every(['light', 'dark'].contains),
          isTrue,
          reason: '$path modes must be light and/or dark',
        );
      }
      if (path.startsWith('assets/icons/')) {
        expect(e['modes'], ['tinted'], reason: path);
      }
    }
  });
}
