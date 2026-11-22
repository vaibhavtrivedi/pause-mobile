import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const INHALE_MS=4000, EXHALE_MS=6000, SESSION_SECONDS=60;
type Phase='inhale'|'exhale';
export default function Breathing(){
  const scale=useRef(new Animated.Value(0.82)).current;
  const glow=useRef(new Animated.Value(0.35)).current;
  const [phase,setPhase]=useState<Phase>('inhale');
  const [elapsed,setElapsed]=useState(0);
  const [running,setRunning]=useState(true);
  const [haptics,setHaptics]=useState(false);
  const [finished,setFinished]=useState(false);
  const cycle=useRef<Animated.CompositeAnimation|null>(null);
  const phaseTimer=useRef<ReturnType<typeof setInterval>|null>(null);
  const elapsedRef=useRef(0);
  const phaseRef=useRef<Phase>('inhale');

  const stopCycle=useCallback(()=>{cycle.current?.stop();cycle.current=null;},[]);
  const startCycle=useCallback((initial:Phase='inhale')=>{
    stopCycle();
    const inhale=initial==='inhale';
    if(inhale){scale.setValue(0.82);glow.setValue(0.28);}
    else {scale.setValue(1.12);glow.setValue(0.8);}
    const animation=Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(scale,{toValue:1.12,duration:INHALE_MS,easing:Easing.inOut(Easing.ease),useNativeDriver:true}),
        Animated.timing(glow,{toValue:0.8,duration:INHALE_MS,easing:Easing.inOut(Easing.ease),useNativeDriver:true})
      ]),
      Animated.parallel([
        Animated.timing(scale,{toValue:0.82,duration:EXHALE_MS,easing:Easing.inOut(Easing.ease),useNativeDriver:true}),
        Animated.timing(glow,{toValue:0.28,duration:EXHALE_MS,easing:Easing.inOut(Easing.ease),useNativeDriver:true})
      ])
    ]));
    cycle.current=animation;animation.start();
  },[glow,scale,stopCycle]);

  useEffect(()=>{
    if(!running||finished)return;
    startCycle('inhale');
    phaseRef.current='inhale';setPhase('inhale');
    phaseTimer.current=setInterval(()=>{
      const next=elapsedRef.current+1;
      elapsedRef.current=next;setElapsed(next);
      const nextPhase:Phase=(next%10)<4?'inhale':'exhale';
      if(nextPhase!==phaseRef.current){
        phaseRef.current=nextPhase;setPhase(nextPhase);
        if(haptics) Haptics.selectionAsync().catch(()=>{});
      }
      if(next>=SESSION_SECONDS){
        setRunning(false);setFinished(true);stopCycle();
        if(phaseTimer.current)clearInterval(phaseTimer.current);
      }
    },1000);
    return ()=>{if(phaseTimer.current)clearInterval(phaseTimer.current);stopCycle();};
  },[running,finished,haptics,startCycle,stopCycle]);

  const togglePause=()=>{
    if(running){setRunning(false);stopCycle();if(phaseTimer.current)clearInterval(phaseTimer.current);}
    else {setRunning(true);}
  };
  const reset=()=>{stopCycle();if(phaseTimer.current)clearInterval(phaseTimer.current);elapsedRef.current=0;setElapsed(0);setPhase('inhale');phaseRef.current='inhale';setFinished(false);setRunning(true);};
  const leave=()=>{stopCycle();if(phaseTimer.current)clearInterval(phaseTimer.current);router.replace('/choose');};
  const remaining=Math.max(0,SESSION_SECONDS-elapsed);
  const progress=elapsed/SESSION_SECONDS;

  if(finished)return <LinearGradient colors={['#091326','#142C4C','#172D46']} style={s.page}><View style={s.center}><Text style={s.spark}>✦</Text><Text style={s.title}>You made space for calm.</Text><Text style={s.subtitle}>You completed a minute of gentle breathing. Notice how you feel—there's no right answer.</Text><Pressable style={s.primary} onPress={()=>router.replace({pathname:'/complete',params:{activity:'Breathing Orb',duration:'60'}})}><Text style={s.primaryText}>CONTINUE  →</Text></Pressable><Pressable onPress={reset} style={s.secondary}><Text style={s.secondaryText}>Repeat breathing</Text></Pressable></View></LinearGradient>;

  return <LinearGradient colors={['#081326','#102747','#173653']} style={s.page}>
    <View style={s.header}><Pressable onPress={leave} accessibilityRole="button"><Text style={s.back}>‹  EXIT</Text></Pressable><Pressable onPress={()=>setHaptics(v=>!v)} accessibilityRole="switch" accessibilityState={{checked:haptics}}><Text style={s.haptic}>{haptics?'◉ HAPTICS ON':'○ HAPTICS OFF'}</Text></Pressable></View>
    <View style={s.center}>
      <Text style={s.eyebrow}>PAUSE · BREATHING ORB</Text>
      <Text style={s.title}>Follow the light.</Text>
      <Text style={s.subtitle}>Breathe gently, at a pace that feels comfortable for you.</Text>
      <View style={s.orbStage}>
        <Animated.View style={[s.halo,{opacity:glow,transform:[{scale}]}]}/>
        <Animated.View style={[s.orbOuter,{transform:[{scale}]}]}>
          <View style={s.orbMiddle}><View style={s.orbInner}><Text style={s.star}>✦</Text></View></View>
        </Animated.View>
      </View>
      <Text accessibilityLiveRegion="polite" style={s.phase}>{running?(phase==='inhale'?'Breathe in gently':'Breathe out slowly'):'Take your time'}</Text>
      <Text style={s.hint}>{running?(phase==='inhale'?'Let the light grow.':'Let the light soften.'):'Paused. Resume when you feel ready.'}</Text>
      <View style={s.progressTrack}><View style={[s.progressFill,{width:`${progress*100}%`}]}/></View>
      <View style={s.timeRow}><Text style={s.time}>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')} remaining</Text><Text style={s.time}>1 minute</Text></View>
      <Pressable style={s.primary} onPress={togglePause}><Text style={s.primaryText}>{running?'PAUSE SESSION':'RESUME SESSION'}</Text></Pressable>
      <Pressable style={s.secondary} onPress={reset}><Text style={s.secondaryText}>Start again</Text></Pressable>
      <Text style={s.footnote}>No breath-holding. If this rhythm feels uncomfortable, return to your natural breathing or stop.</Text>
    </View>
  </LinearGradient>;
}
const s=StyleSheet.create({
 page:{flex:1,paddingHorizontal:24,paddingTop:60,paddingBottom:24},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},back:{color:'#C4D8F4',fontSize:14,fontWeight:'700'},haptic:{color:'#B5CBE8',fontSize:10,fontWeight:'700',letterSpacing:1},
 center:{flex:1,alignItems:'center',justifyContent:'center'},eyebrow:{color:'#AFC8EC',fontSize:10,fontWeight:'800',letterSpacing:2},title:{color:'#F6F8FF',fontSize:30,fontWeight:'800',textAlign:'center',marginTop:12},subtitle:{color:'#B9C9E0',fontSize:14,lineHeight:22,textAlign:'center',marginTop:10,maxWidth:300},
 orbStage:{height:260,width:'100%',alignItems:'center',justifyContent:'center',marginVertical:10},halo:{position:'absolute',width:230,height:230,borderRadius:130,backgroundColor:'#6C9EDB'},orbOuter:{width:190,height:190,borderRadius:110,backgroundColor:'#294A78',alignItems:'center',justifyContent:'center',shadowColor:'#86B8FF',shadowOpacity:0.4,shadowRadius:32,elevation:12},orbMiddle:{width:145,height:145,borderRadius:90,backgroundColor:'#5484BB',alignItems:'center',justifyContent:'center'},orbInner:{width:92,height:92,borderRadius:60,backgroundColor:'#D0E6FF',alignItems:'center',justifyContent:'center'},star:{fontSize:34,color:'#31547D'},
 phase:{color:'#FFFFFF',fontSize:23,fontWeight:'700',marginTop:4},hint:{color:'#C2D2E9',fontSize:13,marginTop:8},progressTrack:{height:5,width:'100%',backgroundColor:'#314764',borderRadius:8,marginTop:30,overflow:'hidden'},progressFill:{height:5,backgroundColor:'#A8C9FF',borderRadius:8},timeRow:{width:'100%',flexDirection:'row',justifyContent:'space-between',marginTop:9},time:{color:'#AFC1DA',fontSize:11},
 primary:{backgroundColor:'#B7D3FF',paddingVertical:16,borderRadius:15,width:'100%',alignItems:'center',marginTop:27},primaryText:{color:'#10213B',fontWeight:'900',letterSpacing:1},secondary:{padding:13,marginTop:5},secondaryText:{color:'#C2D6F2',fontWeight:'600'},footnote:{color:'#92A8C8',fontSize:10,lineHeight:16,textAlign:'center',marginTop:8}
});
