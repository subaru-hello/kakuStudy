import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { TImage } from "@/types";
import { deleteStudyItemById, listStudyItems } from "@/lib/study-items";
import { Ionicons } from "@expo/vector-icons";

export default function StudyListScreen() {
  const [imageList, setImageList] = useState<TImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // routerフックを使う
  const fetchImages = async () => {
    setIsLoading(true); // データ取得中の状態を管理
    const images = await listStudyItems();
    setImageList(images);
    setIsLoading(false);
  };
  const deleteImage = async (id: number) => {
    // 画像を削除する処理
    const updatedImages = imageList.filter((item) => item.id !== id);
    setImageList(updatedImages); // JSスレッドで保持
    Alert.alert("削除しました");
    await deleteStudyItemById(id);
  };
  // タブ遷移時にデータを取得する
  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        {/* <Text style={styles.loadingText}>読み込み中...</Text> */}
      </View>
    );
  }
  if (imageList.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noItemsContainer}>
          <Text>画像がありません</Text>
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/study/create")}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={imageList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.imageContainer}>
              {/* 左上のバツボタン */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => deleteImage(item.id)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <Link
                key={item.id}
                href={{
                  pathname: "/study/[id]",
                  params: { id: item.id },
                }}
              >
                {/* 画像表示 */}
                <Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </Link>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/study/create")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: "center", // 縦方向の中央揃え
    alignItems: "center", // 横方向の中央揃え
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  loadingContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // 半透明の背景
    width: "100%",
    height: "100%",
  },
  listContent: {
    paddingVertical: 10,
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    marginVertical: 8,
  },
  imageContainer: {
    position: "relative",
    width: "90%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 5,
    borderRadius: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 右下に表示する丸ボタン
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30, // 高さ/2 で丸に

    backgroundColor: "#f57c00",
    alignItems: "center",
    justifyContent: "center",

    // iOS向けシャドウ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,

    // Android向けシャドウ
    elevation: 5,
  },
});
