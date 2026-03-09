import React, { useState } from "react";
import { StyleSheet, Image, View, LayoutChangeEvent } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { RectMask } from "@/types";
import Svg, { Circle, Line, Rect } from "react-native-svg";

type Props = {
  imageUri: string;
  rectMasks: RectMask[];
  onChangeMaskData: (rectMasks: RectMask[]) => void;
};

export default function ImageMaskDrawerRect({
  imageUri,
  rectMasks,
  onChangeMaskData,
}: Props) {
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [currentRect, setCurrentRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  // 親Viewではなく、画像とSVGをひとまとめにして onLayout で width/height を取得
  const onImageLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    console.log("Displayed image size:", width, height);
    setImgWidth(width);
    setImgHeight(height);
  };

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      // 画像領域の left/top は 0, right は imgWidth, bottom は imgHeight として扱う
      if (e.x < 0 || e.x > imgWidth || e.y < 0 || e.y > imgHeight) {
        // 画像枠外で開始されたらジェスチャ無効
        return;
      }

      // 画像枠内ならドラッグ開始
      setCurrentRect({
        startX: e.x,
        startY: e.y,
        endX: e.x,
        endY: e.y,
      });
    })
    .onUpdate((e) => {
      // すでにドラッグ開始しているときだけ更新
      setCurrentRect((prev) => {
        if (!prev) return null;

        // ここでも範囲をはみ出さないように x,y をクランプする
        const clampedX = Math.min(Math.max(e.x, 0), imgWidth);
        const clampedY = Math.min(Math.max(e.y, 0), imgHeight);

        return {
          ...prev,
          endX: clampedX,
          endY: clampedY,
        };
      });
    })
    .onEnd(() => {
      if (!currentRect || imgWidth === 0 || imgHeight === 0) {
        setCurrentRect(null);
        return;
      }

      const { startX, startY, endX, endY } = currentRect;
      // 画像に対する相対座標へ変換するロジックはそのまま
      const x1 = startX / imgWidth;
      const y1 = startY / imgHeight;
      const x2 = endX / imgWidth;
      const y2 = endY / imgHeight;

      onChangeMaskData([...rectMasks, { x1, y1, x2, y2 }]);
      setCurrentRect(null);
    });

  // const handleCloseButton = (i: number) => {
  //   console.log("touche", i, rectMasks);
  //   const newArr = rectMasks.filter((_, idx) => idx !== i);
  //   onChangeMaskData([...newArr]);
  //   // onChangeMaskData(newArr);
  // };
  const handleCloseButton = (i: number) => {
    const newArr = rectMasks.filter((_, idx) => idx !== i);
    onChangeMaskData(newArr);
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 親コンテナは「配置の自由度をもたせるため」程度。 */}
      <View style={styles.container}>
        <GestureDetector gesture={panGesture}>
          {/* 画像とSVGを一つのViewでラップ */}
          <View style={styles.imageWrapper}>
            <Image
              onLayout={onImageLayout}
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
            <Svg style={StyleSheet.absoluteFill}>
              {/* 既存マスク表示 */}
              {rectMasks.map((r, i) => {
                const rx1 = Math.min(r.x1, r.x2) * imgWidth;
                const ry1 = Math.min(r.y1, r.y2) * imgHeight;
                const rx2 = Math.max(r.x1, r.x2) * imgWidth;
                const ry2 = Math.max(r.y1, r.y2) * imgHeight;

                return (
                  <React.Fragment key={i}>
                    {/* 背景の黒いマスク */}
                    <Rect
                      x={rx1}
                      y={ry1}
                      width={rx2 - rx1}
                      height={ry2 - ry1}
                      fill="black"
                    />

                    {/* 白い削除アイコン */}
                    <Circle
                      cx={rx1 + 2} // 中心座標: Rect の位置 + アイコンの中心分
                      cy={ry1 + 2} // 同上
                      r={10} // 半径
                      fill="white"
                      onPress={() => handleCloseButton(i)}
                    />
                    <Line
                      x1={rx1 - 2}
                      y1={ry1 - 2}
                      x2={rx1 + 6}
                      y2={ry1 + 6}
                      stroke="black"
                      strokeWidth={2}
                      onPress={() => handleCloseButton(i)}
                    />
                    <Line
                      x1={rx1 + 6}
                      y1={ry1 - 2}
                      x2={rx1 - 2}
                      y2={ry1 + 6}
                      stroke="black"
                      strokeWidth={2}
                      onPress={() => handleCloseButton(i)}
                    />
                  </React.Fragment>
                );
              })}

              {/* ドラッグ中の点線表示 */}
              {currentRect && (
                <Rect
                  x={Math.min(currentRect.startX, currentRect.endX)}
                  y={Math.min(currentRect.startY, currentRect.endY)}
                  width={Math.abs(currentRect.endX - currentRect.startX)}
                  height={Math.abs(currentRect.endY - currentRect.startY)}
                  fill="none"
                  stroke="blue"
                  strokeWidth={2}
                  strokeDasharray={[5, 5]}
                />
              )}
            </Svg>
          </View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrapper: {
    // ここで onLayout を使って実際の width/height を取得
    position: "relative",
    width: "100%",
    height: "100%",
    alignSelf: "center", // 横中央寄せ (必要に応じて)
    flex: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
