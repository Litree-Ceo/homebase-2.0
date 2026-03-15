try {
  require('@google-cloud/aiplatform');
  require('@google-cloud/firestore');
  require('firebase-admin');
  require('express');
  console.log('Dependencies loaded successfully.');
} catch (e) {
  console.error('Dependency check failed:', e);
  process.exit(1);
}
