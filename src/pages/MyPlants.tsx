import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
} from 'react-native';
import { Header } from '../components/Header';
import { Load } from '../components/Load';

import waterdropImage from '../assets/waterdrop.png';

import colors from '../styles/colors';
import { FlatList } from 'react-native-gesture-handler';

import { loadPlant, PlantProps, removePlant } from '../libs/storage';
import { formatDistance } from 'date-fns';
import { pt } from 'date-fns/locale';
import fonts from '../styles/fonts';
import { PlantCardSecondary } from '../components/PlantCardSecondary';

export function MyPlants() {
  const [myPlants, setMyPlants] = useState<PlantProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextWaterd, setNextWaterd] = useState<string>();

  function handleRemove(plant: PlantProps) {
      Alert.alert('Remover', `Deseja remover a ${plant.name}?`, [
        {
          text: 'Não 🙏',
          style: 'cancel',
        },
        {
          text: 'Sim 😢',
          onPress: async () => {
            try {
              await removePlant(plant.id);

              setMyPlants((oldData) => {
                const filtredItems = oldData.filter(item => item.id !== plant.id);

                if (!filtredItems.length) {
                  setNextWaterd(
                    'Nenhuma planta salva 😭.'
                  );

                  return [];
                }

                return filtredItems;
              });
            } catch (error) {
              Alert.alert('Não foi possivel remover! 😢')
            }
          }
        }
      ]);
  };

  useEffect(() => {
    async function loadStorageData() {
      const plantsStoraged = await loadPlant();

      if (!plantsStoraged.length) {
        setNextWaterd(
          'Nenhuma planta salva 😭.'
        );
        setLoading(false);

        return;
      }

      const nextTime = formatDistance(
        new Date(plantsStoraged[0].dateTimeNotification).getTime(),
        new Date().getTime(),
        { locale: pt }
      );

      setNextWaterd(
        `Regue sua ${plantsStoraged[0].name} daqui a ${nextTime}`
      );

      setMyPlants(plantsStoraged);
      setLoading(false);
    }

    loadStorageData();
  }, []);


  if (loading)
    return <Load />

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.spotlight}>
        <Image
          source={waterdropImage}
          style={styles.spotlightImage}
        />

        <Text style={styles.spotlightText}>
          {nextWaterd}
        </Text>
      </View>

      <View style={styles.plants}>
        <Text style={styles.plantsTitle}>
          Próximas regadas
        </Text>

        <FlatList
          data={myPlants}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flex: 1, }}
          renderItem={({ item }) => (
            <PlantCardSecondary
              data={item}
              handleRemove={() => handleRemove(item)}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 50,
    backgroundColor: colors.background,
  },

  spotlight: {
    backgroundColor: colors.blue_light,
    paddingHorizontal: 20,
    borderRadius: 20,
    height: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  spotlightImage: {
    width: 60,
    height: 60,
  },

  spotlightText: {
    flex: 1,
    color: colors.blue,
    paddingHorizontal: 20,
  },

  plants: {
    flex: 1,
    width: '100%',
  },

  plantsTitle: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: colors.heading,
    marginVertical: 20,
  }
});
