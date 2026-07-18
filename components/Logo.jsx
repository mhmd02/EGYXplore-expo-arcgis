import { Image, useColorScheme } from "react-native";
import Logo from "../assets/icon.png";

export default function ThemedLogo({ style }) {
  const colorSchema = useColorScheme();
  const logo = Logo;
  return <Image source={logo} style={style} />;
}
