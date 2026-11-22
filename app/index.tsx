import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
const C={text:'#F5F7FF',muted:'#B8C6DF',blue:'#A8C9FF'};
export default function Home(){return <LinearGradient colors={['#091326','#122744','#172D46']} style={s.page}><ScrollView contentContainerStyle={s.content}>
<View style={s.top}><Text style={s.brand}>PAUSE</Text><Text style={s.tag}>FIND YOUR CALM. FIND YOUR CONTROL.</Text></View>
<View style={s.hero}><View style={s.orbOuter}><View style={s.orbMiddle}><View style={s.orbInner}><Text style={{fontSize:30,color:'#294A80'}}>✦</Text></View></View></View>
<Text style={s.title}>Take a moment for yourself.</Text><Text style={s.body}>Whatever happened, you can choose what happens next.</Text>
<Pressable accessibilityRole="button" accessibilityLabel="Start your reset" style={s.primary} onPress={()=>router.push('/choose')}><Text style={s.primaryText}>START MY RESET  →</Text></Pressable>
<Text style={s.small}>No pressure. No judgement. Just you.</Text>
<Pressable onPress={()=>router.push('/history')} style={s.history}><Text style={s.historyText}>VIEW MY PAUSE MOMENTS  →</Text></Pressable></View>
<View style={s.card}><Text style={s.cardTitle}>A small step counts.</Text><Text style={s.body}>Your Calm Universe grows as you explore activities and practice pausing.</Text></View>
</ScrollView></LinearGradient>}
const s=StyleSheet.create({page:{flex:1},content:{padding:24,paddingTop:64,paddingBottom:40},top:{marginBottom:34},brand:{color:C.blue,fontSize:34,fontWeight:'800',letterSpacing:5},tag:{color:C.muted,fontSize:9,letterSpacing:2,marginTop:5},hero:{backgroundColor:'#132541',borderRadius:28,padding:24,alignItems:'center',borderWidth:1,borderColor:'#2C456A'},orbOuter:{width:170,height:170,borderRadius:100,backgroundColor:'#263F68',alignItems:'center',justifyContent:'center',marginBottom:24},orbMiddle:{width:130,height:130,borderRadius:100,backgroundColor:'#507BB3',alignItems:'center',justifyContent:'center'},orbInner:{width:82,height:82,borderRadius:100,backgroundColor:'#C5DFFF',alignItems:'center',justifyContent:'center'},title:{fontSize:25,fontWeight:'700',color:C.text,textAlign:'center',lineHeight:32},body:{fontSize:14,color:C.muted,textAlign:'center',lineHeight:22,marginTop:10},primary:{backgroundColor:C.blue,paddingVertical:17,borderRadius:16,width:'100%',alignItems:'center',marginTop:24},primaryText:{color:'#10203A',fontWeight:'800',letterSpacing:1},small:{color:'#AABBD5',fontSize:11,marginTop:14},history:{padding:14,marginTop:6},historyText:{color:'#C5D9FF',fontSize:11,fontWeight:'800',letterSpacing:1},card:{backgroundColor:'#132541',borderRadius:18,padding:18,marginTop:24},cardTitle:{color:C.text,fontWeight:'700',fontSize:16}});
