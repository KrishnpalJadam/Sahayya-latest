const fs = require('fs');
const file = 'c:/Users/Ahmed Bilal Khan/Desktop/sahaya/sahaya-app-india/src/Screens/Auth/StaffProfile/StepLoactionStaff.js';
let content = fs.readFileSync(file, 'utf8');

// Current Address Block Replacement
const currentBlockStart = content.indexOf('        <View style={styles.wrap}>\n          <View style={styles.headerWithLocation}>');
const currentBlockEndStr = '            maxLength={6}\n          />\n        </View>';
const currentBlockEnd = content.indexOf(currentBlockEndStr, currentBlockStart) + currentBlockEndStr.length;

if (currentBlockStart > -1 && currentBlockEnd > currentBlockStart) {
  const newCurrent = `        <View style={styles.wrap}>
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
        </View>`;
  content = content.substring(0, currentBlockStart) + newCurrent + content.substring(currentBlockEnd);
} else {
  console.log("Failed to match Current Address block");
}

// Permanent Address Block Replacement
const permBlockStart = content.indexOf('        <View style={styles.wrap}>\n          <Typography type={Font?.Poppins_SemiBold} size={18}>\n            {LocalizedStrings.EditProfile?.Permanent_Address || \'Permanent Address\'}\n          </Typography>');
const permBlockEndStr = '          )}\n        </View>';
const permBlockEnd = content.indexOf(permBlockEndStr, permBlockStart) + permBlockEndStr.length;

if (permBlockStart > -1 && permBlockEnd > permBlockStart) {
  const newPerm = `        <View style={styles.wrap}>
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
        </View>`;
  content = content.substring(0, permBlockStart) + newPerm + content.substring(permBlockEnd);
} else {
  console.log("Failed to match Permanent Address block");
}

// Styles Replacement
const styleStart = content.indexOf('  wrap: {\n    borderWidth: 1,\n    borderColor: \'#EBEBEA\',\n    padding: 20,\n    borderRadius: 10,\n    marginTop: 20,\n  },');
const styleEnd = content.indexOf('  },\n});');
if (styleStart > -1 && styleEnd > styleStart) {
  const newStyles = `  cityContainer: {
    flex: 1,
    marginRight: 8,
  },
  stateContainer: {
    flex: 1,
    marginLeft: 8,
  },
  wrap: {
    borderWidth: 1,
    borderColor: '#EBEBEA',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressIntro: {
    marginTop: 5,
    marginBottom: 3,
    lineHeight: 18,
  },
  addressDetails: {
    marginTop: 8,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0E6E4',
  },
  mapFirstHint: {
    marginTop: 2,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
  }`;
  content = content.substring(0, styleStart) + newStyles + content.substring(styleEnd);
} else {
  console.log("Failed to match Styles block");
}

fs.writeFileSync(file, content);
console.log('Replacements completed.');
