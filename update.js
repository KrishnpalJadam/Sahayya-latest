const fs = require('fs');
const file = 'c:/Users/Ahmed Bilal Khan/Desktop/sahaya/sahaya-app-india/src/Screens/Auth/StaffProfile/StepLoactionStaff.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  /import GooglePlacesInput from '\.\.\/\.\.\/\.\.\/Component\/GooglePlacesInput';/,
  'import MapLocationPicker from \'../../../Component/MapLocationPicker\';'
);
content = content.replace(
  /import \{ StyleSheet, View, TouchableOpacity, Image, Alert, Platform, Linking \} from 'react-native';/,
  'import { StyleSheet, View, TouchableOpacity, Image } from \'react-native\';'
);
content = content.replace(
  /import Geolocation from '@react-native-community\/geolocation';\n/,
  ''
);

// 2. Remove Geolocation methods
const startLoc = content.indexOf('  // Function to get location from coordinates using reverse geocoding');
const endLoc = content.indexOf('  const addressesString = useMemo');
if(startLoc > -1 && endLoc > -1) {
  const replacement = `  const handleCurrentPlaceSelected = location => {
    setCurrentGoogleLocation(location?.google_location || '');
    setCurrentLat(location?.lat ? String(location.lat) : '');
    setCurrentLong(location?.long ? String(location.long) : '');
    const mappedArea = location?.area_locality || location?.street;
    if (mappedArea) setCurrentAreaLocality(mappedArea);
    if (location?.city) setCurrentCity(location.city);
    if (location?.state) setCurrentState(location.state);
    if (location?.pincode) setCurrentPincode(location.pincode);
    setErrors(prev => ({
      ...prev,
      currentGoogleLocation: null,
      currentAreaLocality: mappedArea ? null : prev?.currentAreaLocality,
      currentCity: location?.city ? null : prev?.currentCity,
      currentState: location?.state ? null : prev?.currentState,
      currentPincode: location?.pincode ? null : prev?.currentPincode,
    }));
  };

  const handlePermanentPlaceSelected = location => {
    setPermanentGoogleLocation(location?.google_location || '');
    setPermanentLat(location?.lat ? String(location.lat) : '');
    setPermanentLong(location?.long ? String(location.long) : '');
    const mappedArea = location?.area_locality || location?.street;
    if (mappedArea) setPermanentAreaLocality(mappedArea);
    if (location?.city) setPermanentCity(location.city);
    if (location?.state) setPermanentState(location.state);
    if (location?.pincode) setPermanentPincode(location.pincode);
    setErrors(prev => ({
      ...prev,
      permanentGoogleLocation: null,
      permanentAreaLocality: mappedArea ? null : prev?.permanentAreaLocality,
      permanentCity: location?.city ? null : prev?.permanentCity,
      permanentState: location?.state ? null : prev?.permanentState,
      permanentPincode: location?.pincode ? null : prev?.permanentPincode,
    }));
  };

`;
  content = content.substring(0, startLoc) + replacement + content.substring(endLoc);
}
content = content.replace('  const [loadingLocation, setLoadingLocation] = useState(false);\n', '');

// 3. Replace Current Address JSX block
const startJSX1 = content.indexOf('        <View style={styles.wrap}>\n          <View style={styles.headerWithLocation}>');
const endJSX1 = content.indexOf('      <View style={{ flex: 1 }}>\n        <View style={styles.wrap}>\n          <Typography type={Font?.Poppins_SemiBold} size={18}>\n            {LocalizedStrings.EditProfile?.Permanent_Address || \'Permanent Address\'}\n          </Typography>');

const newJSX1 = `        <View style={styles.wrap}>
          <View style={styles.headerRow}>
            <Typography type={Font?.Poppins_SemiBold} size={18}>
              {LocalizedStrings.EditProfile?.Current_Address || 'Current Address'}
            </Typography>
          </View>
          <Typography size={12} color="#707070" style={styles.addressIntro}>
            Choose the exact location first, then complete your address details.
          </Typography>

          <MapLocationPicker
            title="Pin your exact location"
            location={{
              google_location: currentGoogleLocation,
              lat: currentLat,
              long: currentLong,
              street: currentStreet,
              area_locality: currentAreaLocality,
              city: currentCity,
              state: currentState,
              pincode: currentPincode,
            }}
            selectedLabel={[currentAreaLocality, currentCity, currentState].filter(Boolean).join(', ')}
            onConfirm={handleCurrentPlaceSelected}
            error={errors?.currentGoogleLocation}
          />

          {currentGoogleLocation ? (
            <View style={styles.addressDetails}>
              <Typography type={Font.Poppins_SemiBold} size={15}>
                Complete address
              </Typography>
              <Input
                title="House / Flat / Floor / Block"
                placeholder="e.g. Flat 12B, 3rd Floor"
                value={currentStreet}
                onChange={text => {
                  setCurrentStreet(text);
                  if (errors.currentStreet) setErrors({...errors, currentStreet: null});
                }}
                error={errors.currentStreet}
              />
              <Input
                title="Apartment / Building / Road / Area"
                placeholder="e.g. Phase 1, Model Town"
                value={currentAreaLocality}
                onChange={text => {
                  setCurrentAreaLocality(text);
                  if (errors.currentAreaLocality) setErrors({...errors, currentAreaLocality: null});
                }}
                error={errors.currentAreaLocality}
              />
              <View style={styles.row}>
                <View style={styles.cityContainer}>
                  <Input
                    title={LocalizedStrings.EditProfile?.City || 'City'}
                    placeholder="Auto-filled, or enter city"
                    value={currentCity}
                    onChange={text => {
                      setCurrentCity(text);
                      if (errors.currentCity) setErrors({...errors, currentCity: null});
                    }}
                    error={errors.currentCity}
                  />
                </View>
                <View style={styles.stateContainer}>
                  <Input
                    title={LocalizedStrings.EditProfile?.State || 'State'}
                    placeholder="Auto-filled, or enter state"
                    value={currentState}
                    onChange={text => {
                      setCurrentState(text);
                      if (errors.currentState) setErrors({...errors, currentState: null});
                    }}
                    error={errors.currentState}
                  />
                </View>
              </View>
              <Input
                title={LocalizedStrings.EditProfile?.Pincode || LocalizedStrings.StaffProfile?.Pincode || 'Pincode'}
                placeholder="Enter 6-digit pincode"
                keyboardType="numeric"
                value={currentPincode}
                onChange={text => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setCurrentPincode(numericValue);
                  if (errors.currentPincode) setErrors({...errors, currentPincode: null});
                }}
                error={errors.currentPincode}
                maxLength={6}
              />
            </View>
          ) : (
            <View style={styles.mapFirstHint}>
              <Typography size={11} color="#777777">
                Address fields will appear after you confirm the pin.
              </Typography>
            </View>
          )}
        </View>
      </View>
`;

if (startJSX1 > -1 && endJSX1 > -1) {
  content = content.substring(0, startJSX1) + newJSX1 + content.substring(endJSX1);
}

// 4. Replace Permanent Address JSX block
const startJSX2 = content.indexOf('      <View style={{ flex: 1 }}>\n        <View style={styles.wrap}>\n          <Typography type={Font?.Poppins_SemiBold} size={18}>\n            {LocalizedStrings.EditProfile?.Permanent_Address || \'Permanent Address\'}\n          </Typography>');
const endJSX2 = content.indexOf('    </>\n  );\n});\n\nexport default StepLoactionStaff;');

const newJSX2 = `      <View style={{ flex: 1 }}>
        <View style={styles.wrap}>
          <View style={styles.headerRow}>
            <Typography type={Font?.Poppins_SemiBold} size={18}>
              {LocalizedStrings.EditProfile?.Permanent_Address || 'Permanent Address'}
            </Typography>
          </View>
          <Typography size={12} color="#707070" style={styles.addressIntro}>
            Choose the exact location first, then complete your address details.
          </Typography>

          <MapLocationPicker
            title="Pin your exact location"
            location={{
              google_location: permanentGoogleLocation,
              lat: permanentLat,
              long: permanentLong,
              street: permanentStreet,
              area_locality: permanentAreaLocality,
              city: permanentCity,
              state: permanentState,
              pincode: permanentPincode,
            }}
            selectedLabel={[permanentAreaLocality, permanentCity, permanentState].filter(Boolean).join(', ')}
            onConfirm={handlePermanentPlaceSelected}
            error={errors?.permanentGoogleLocation}
          />

          {permanentGoogleLocation ? (
            <View style={styles.addressDetails}>
              <Typography type={Font.Poppins_SemiBold} size={15}>
                Complete address
              </Typography>
              <Input
                title="House / Flat / Floor / Block"
                placeholder="e.g. Flat 12B, 3rd Floor"
                value={permanentStreet}
                onChange={text => {
                  setPermanentStreet(text);
                  if (errors.permanentStreet) setErrors({...errors, permanentStreet: null});
                }}
                error={errors.permanentStreet}
              />
              <Input
                title="Apartment / Building / Road / Area"
                placeholder="e.g. Phase 1, Model Town"
                value={permanentAreaLocality}
                onChange={text => {
                  setPermanentAreaLocality(text);
                  if (errors.permanentAreaLocality) setErrors({...errors, permanentAreaLocality: null});
                }}
                error={errors.permanentAreaLocality}
              />
              <View style={styles.row}>
                <View style={styles.cityContainer}>
                  <Input
                    title={LocalizedStrings.EditProfile?.City || 'City'}
                    placeholder="Auto-filled, or enter city"
                    value={permanentCity}
                    onChange={text => {
                      setPermanentCity(text);
                      if (errors.permanentCity) setErrors({...errors, permanentCity: null});
                    }}
                    error={errors.permanentCity}
                  />
                </View>
                <View style={styles.stateContainer}>
                  <Input
                    title={LocalizedStrings.EditProfile?.State || 'State'}
                    placeholder="Auto-filled, or enter state"
                    value={permanentState}
                    onChange={text => {
                      setPermanentState(text);
                      if (errors.permanentState) setErrors({...errors, permanentState: null});
                    }}
                    error={errors.permanentState}
                  />
                </View>
              </View>
              <Input
                title={LocalizedStrings.EditProfile?.Pincode || LocalizedStrings.StaffProfile?.Pincode || 'Pincode'}
                placeholder="Enter 6-digit pincode"
                keyboardType="numeric"
                value={permanentPincode}
                onChange={text => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setPermanentPincode(numericValue);
                  if (errors.permanentPincode) setErrors({...errors, permanentPincode: null});
                }}
                error={errors.permanentPincode}
                maxLength={6}
              />
            </View>
          ) : (
            <View style={styles.mapFirstHint}>
              <Typography size={11} color="#777777">
                Address fields will appear after you confirm the pin.
              </Typography>
            </View>
          )}
        </View>
      </View>
`;

if (startJSX2 > -1 && endJSX2 > -1) {
  content = content.substring(0, startJSX2) + newJSX2 + content.substring(endJSX2);
}

// 5. Update styles
content = content.replace(
  '  wrap: {\n    borderWidth: 1,\n    borderColor: \'#EBEBEA\',\n    padding: 20,\n    borderRadius: 10,\n    marginTop: 20,\n  },',
  '  cityContainer: {\n    flex: 1,\n    marginRight: 8,\n  },\n  stateContainer: {\n    flex: 1,\n    marginLeft: 8,\n  },\n  wrap: {\n    borderWidth: 1,\n    borderColor: \'#EBEBEA\',\n    padding: 20,\n    borderRadius: 16,\n    marginTop: 20,\n    backgroundColor: \'#FFFFFF\',\n  },'
);
content = content.replace(
  /  headerWithLocation: \{[\s\S]*?\},/,
  '  headerRow: {\n    flexDirection: \'row\',\n    justifyContent: \'space-between\',\n    alignItems: \'center\',\n  },\n  addressIntro: {\n    marginTop: 5,\n    marginBottom: 3,\n    lineHeight: 18,\n  },\n  addressDetails: {\n    marginTop: 8,\n    paddingTop: 15,\n    borderTopWidth: 1,\n    borderTopColor: \'#F0E6E4\',\n  },\n  mapFirstHint: {\n    marginTop: 2,\n    padding: 12,\n    borderRadius: 10,\n    backgroundColor: \'#F8F8F8\',\n  },'
);

content = content.replace(
  /  locationButton: \{[\s\S]*?\},/,
  ''
);

content = content.replace(
  /  locationIcon: \{[\s\S]*?\},/,
  ''
);

fs.writeFileSync(file, content);
console.log('Replaced successfully');
