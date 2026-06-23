(()=>{var Wt={},Ve={};function T(e){return Wt[e.tag]=e,e}function Z(e,t){let o=Wt[e];if(!o)throw new Error("Component not found: "+e);let r=t||{};if(o.state){let i=o.state(t||{});for(let d in i)r[d]=i[d]}if(o.methods)for(let i in o.methods)r[i]=o.methods[i];let n=document.createElement("div");n.innerHTML=o.render(r);let c=n.firstElementChild;return o.onMount&&o.onMount(r,c),c}function w(e,t){(Ve[e]||(Ve[e]=[])).push(t)}function oe(e){let t=Ve[e];if(t)for(let o=0;o<t.length;o++)t[o](e)}var re=6,Ko=28,Ge=Object.create(null),Jo=tr(),B={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:er(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Jo,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0,forecastHours:null},Qo=300;function er(){let e=Object.create(null);for(let t=1;t<=re;t++)e[t]=[];return e}function tr(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<re;)e.push("");return e.slice(0,re)}function or(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(B.zoneNames))}catch(e){}}function ae(e){return"$dashboard:"+e}function wt(e){return Math.max(1,Math.min(re,Number(e)||1))}function $t(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let o=e.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function S(e){let t=Ge[e];return t?t.v!=null?t.v:t.value!=null?t.value:$t(t.s!=null?t.s:t.state):null}function N(e){let t=Ge[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function rr(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function U(e){return rr(N(e))}function x(e,t){let o=Ge[e];o||(o=Ge[e]={v:null,s:null}),"v"in t&&(o.v=t.v,o.value=t.v),"value"in t&&(o.v=t.value,o.value=t.value),"s"in t&&(o.s=t.s,o.state=t.s),"state"in t&&(o.s=t.state,o.state=t.state);for(let r in t)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=t[r]);if(oe(e),e==="text_sensor-firmware_version"&&Fe("firmwareVersion",N(e)||""),e.startsWith("text-zone_")&&e.endsWith("_name")){let r=parseInt(e.slice(10,-5),10);if(r>=1&&r<=re){let n=N(e)||"";B.zoneNames[r-1]!==n&&(B.zoneNames[r-1]=n,or(),oe(ae("zoneNames")))}}}function R(e,t){w(ae(e),t)}function I(e){return B[e]}function Fe(e,t){B[e]=t,oe(ae(e))}function Zt(e){B.section!==e&&(B.section=e,oe(ae("section")))}function jt(e){let t=wt(e);B.selectedZone!==t&&(B.selectedZone=t,oe(ae("selectedZone")))}function Ae(e){let t=!!e;B.live!==t&&(B.live=t,oe(ae("live")))}function Vt(){B.pendingWrites+=1,oe(ae("pendingWrites"))}function _t(){B.pendingWrites=Math.max(0,B.pendingWrites-1),B.lastWriteAt=Date.now(),oe(ae("pendingWrites"))}function Gt(){return B.pendingWrites>0?!0:Date.now()-B.lastWriteAt<2e3}function we(e){return B.zoneNames[wt(e)-1]||""}function Y(e){let t=wt(e),o=we(t);return o?"Zone "+t+" \xB7 "+o:"Zone "+t}function Ne(e){B.i2cResult=e||"No scan has been run yet.",oe(ae("i2cResult"))}function O(e,t){let o={time:ar(),msg:String(e||"")};for(B.activityLog.push(o);B.activityLog.length>60;)B.activityLog.shift();if(t>=1&&t<=re){let r=B.zoneLog[t];for(r.push(o);r.length>8;)r.shift();oe(ae("zoneLog:"+t))}oe(ae("activityLog"))}function Xt(e){return e>=1&&e<=re?B.zoneLog[e]:B.activityLog}function yt(e,t){let o=B[e];if(!Array.isArray(o))return;let r=$t(t);if(r!=null){for(o.push(r);o.length>Ko;)o.shift();oe(ae(e))}}function Re(e){let t=Date.now();if(!e&&t-B.lastHistoryAt<3200)return;B.lastHistoryAt=t;let o=0,r=0;for(let n=1;n<=re;n++){let c=S("sensor-zone_"+n+"_valve_pct");c!=null&&(o+=c,r+=1)}yt("historyFlow",S("sensor-manifold_flow_temperature")),yt("historyReturn",S("sensor-manifold_return_temperature")),yt("historyDemand",r?o/r:0)}function ar(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Xe(e){B.zoneStateHistory=e||null,oe(ae("zoneStateHistory"))}function Ut(){return B.deviceLogSeq}function Ue(e,t){if(Array.isArray(e)&&e.length){for(let o of e)B.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>B.deviceLogSeq&&(B.deviceLogSeq=o[0]);for(;B.deviceLog.length>Qo;)B.deviceLog.shift();oe(ae("deviceLog"))}typeof t=="number"&&t>B.deviceLogSeq&&(B.deviceLogSeq=t-1)}function Yt(){return B.deviceLog}function Kt(){B.deviceLog=[],oe(ae("deviceLog"))}function Ye(e){B.forecastHours=e||null,oe(ae("forecastHours"))}function Ke(){return B.forecastHours}var l={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",name:e=>"text-zone_"+e+"_name",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h",staticFactor:e=>"sensor-zone_"+e+"_static_factor",balanceFactor:e=>"sensor-zone_"+e+"_balance_factor",balanceAdapt:e=>"sensor-zone_"+e+"_balance_adapt",adaptErr:e=>"sensor-zone_"+e+"_adapt_err"},a={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFetchEpoch:"sensor-forecast_fetch_epoch",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c",balanceMode:"select-balance_mode",adaptIntervalS:"number-adapt_interval_s",adaptStep:"number-adapt_step",adaptMin:"number-adapt_min",adaptMax:"number-adapt_max",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var ee=6,nr=8,Jt=null,Te=0,Je=1,Qt=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[3,"hv6_forecast","Forecast updated: 48 hours from Open-Meteo"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],q={temp:new Float32Array(ee),setpoint:new Float32Array(ee),valve:new Float32Array(ee),enabled:new Uint8Array(ee),driversEnabled:1,fault:0,manualMode:0};function sr(){q.manualMode=0,Fe("manualMode",!1);for(let s=0;s<ee;s++){q.temp[s]=20.5+s*.4,q.setpoint[s]=21+s%3*.5,q.valve[s]=12+s*8,q.enabled[s]=s===4?0:1;let u=s+1;x(l.temp(u),{value:q.temp[s]}),x(l.setpoint(u),{value:q.setpoint[s]}),x(l.valve(u),{value:q.valve[s]}),x(l.state(u),{state:q.valve[s]>5?"heating":"idle"}),x(l.enabled(u),{value:!!q.enabled[s],state:q.enabled[s]?"on":"off"}),x(l.probe(u),{state:"Probe "+u}),x(l.tempSource(u),{state:u%2?"Local Probe":"BLE"}),x(l.syncTo(u),{state:"None"}),x(l.pipeType(u),{state:"PEX 16mm"}),x(l.area(u),{value:8+u*3.5}),x(l.spacing(u),{value:[150,200,150,100,200,150][s]}),x(l.ble(u),{state:"AA:BB:CC:DD:EE:0"+u}),x(l.name(u),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][s]||""}),x(l.exteriorWalls(u),{state:["N","E","S","W","N,E","S,W"][s]}),x(l.windExposure(u),{value:[.5,.5,.5,.5,.7,.7][s]}),x(l.solarGain(u),{value:.3}),x(l.thermalLeadH(u),{value:4}),x(l.preheatAdvance(u),{value:.08+s*.03});let g=[.62,.78,1,.55,.88,.7][s],b=[1.08,.95,1,1.15,.9,1.02][s];x(l.staticFactor(u),{value:g}),x(l.balanceAdapt(u),{value:b}),x(l.balanceFactor(u),{value:Math.min(1,g*b)}),x(l.adaptErr(u),{value:[.12,-.05,0,.22,-.1,.03][s]})}for(let s=1;s<=nr;s++){let u=s<=ee?s:ee,g=q.temp[u-1]+(s>ee?1:.1*s);x(l.probeTemp(s),{value:g})}x(a.flow,{value:34.1}),x(a.ret,{value:30.4}),x(a.uptime,{value:18*3600+720}),x(a.wifi,{value:-57}),x(a.drivers,{value:!0,state:"on"}),x(a.fault,{value:!1,state:"off"}),x(a.ip,{state:"192.168.1.86"}),x(a.ssid,{state:"MockLab"}),x(a.mac,{state:"D8:3B:DA:12:34:56"}),x(a.firmware,{state:"0.5.x-mock"}),x(a.manifoldFlowProbe,{state:"Probe 7"}),x(a.manifoldReturnProbe,{state:"Probe 8"}),x(a.manifoldType,{state:"NC (Normally Closed)"}),x(a.motorProfileDefault,{state:"HmIP VdMot"}),x(a.closeThresholdMultiplier,{value:1.7}),x(a.closeSlopeThreshold,{value:1}),x(a.closeSlopeCurrentFactor,{value:1.4}),x(a.openThresholdMultiplier,{value:1.7}),x(a.openSlopeThreshold,{value:.8}),x(a.openSlopeCurrentFactor,{value:1.3}),x(a.openRippleLimitFactor,{value:1}),x(a.genericRuntimeLimitSeconds,{value:45}),x(a.hmipRuntimeLimitSeconds,{value:40}),x(a.relearnAfterMovements,{value:2e3}),x(a.relearnAfterHours,{value:168}),x(a.learnedFactorMinSamples,{value:3}),x(a.learnedFactorMaxDeviationPct,{value:12}),x(a.simplePreheatEnabled,{state:"on"}),x(a.balanceMode,{state:"Adaptive"}),x(a.adaptIntervalS,{value:3600}),x(a.adaptStep,{value:.02}),x(a.adaptMin,{value:.5}),x(a.adaptMax,{value:1.5}),x(a.minZoneFlowPct,{value:15}),x(a.minimumFlowAlways,{state:"off"}),x(a.cpuLoadCore0,{value:18.5}),x(a.cpuLoadCore1,{value:7.2}),x(a.freeInternalKb,{value:142}),x(a.freePsramKb,{value:7800}),Re(!0);let e=300,t=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],n=[];for(let s=0;s<o;s++){let u=(o-1-s)*e,g=t-u,b=Math.floor(s/12)%24,v=r.map(h=>h[b%h.length]),f=u/3600,m=f>2.5&&f<3.5||f>8.5&&f<9.5?1:0,z=v.filter(h=>h===5).length,p=Math.round(Math.min(100,z*15+Math.abs(Math.sin(s/8))*6)),_=Number((30+z*1.4+Math.sin(s/11)*1.5).toFixed(1)),k=Number((_-(1.4+z*.35)).toFixed(1));n.push([g,...v,m,_,k,p])}Xe({interval_s:e,uptime_s:t,count:o,entries:n});let c=[];for(let s=0;s<48;s++){let u=6-3*Math.sin(s/24*Math.PI)-(s>10&&s<20?2:0),g=4+(s>8&&s<18?9*Math.exp(-Math.pow(s-13,2)/12):0)+Math.sin(s/5),b=(220+s*4)%360,v=s%24,f=Math.max(0,Math.round(820*Math.sin((v-6)/12*Math.PI)));c.push([Number(u.toFixed(1)),Number(Math.max(0,g).toFixed(1)),Math.round(b),f])}let i=new Date(t*1e3);i.setHours(0,0,0,0);let d=Math.floor(i.getTime()/1e3);Ye({base_epoch:d,age_s:480,fetch_epoch:t-480,count:48,hours:c}),eo(6)}function eo(e){let t=[];for(let o=0;o<e;o++){let r=Qt[Je%Qt.length];t.push([Je,r[0],r[1],r[2]]),Je++}Ue(t,Je)}function ir(){Te+=1,x(a.uptime,{value:Number(Date.now()/1e3)|0}),x(a.wifi,{value:-55-Math.round((1+Math.sin(Te/4))*6)});let e=0,t=0,o=0;for(let i=0;i<ee;i++){let d=i+1,s=!!q.enabled[i],u=q.temp[i],g=q.setpoint[i],b=s&&q.driversEnabled&&!q.manualMode&&u<g-.25;q.manualMode?q.valve[i]=Math.max(0,q.valve[i]):!s||!q.driversEnabled?q.valve[i]=Math.max(0,q.valve[i]-6):b?q.valve[i]=Math.min(100,q.valve[i]+7+d%3):q.valve[i]=Math.max(0,q.valve[i]-5);let v=b?.05+q.valve[i]/2200:-.03+q.valve[i]/3200;q.temp[i]=u+v+Math.sin((Te+d)/5)*.04,s&&q.valve[i]>0&&(e+=q.valve[i],t+=1,o=Math.max(o,q.valve[i])),x(l.temp(d),{value:q.temp[i]}),x(l.valve(d),{value:Math.round(q.valve[i])});let f=Math.max(0,(q.setpoint[i]-q.temp[i]-.15)*.22);x(l.preheatAdvance(d),{value:Number(f.toFixed(2))}),x(l.state(d),{state:s?b?"heating":"idle":"off"}),x(l.enabled(d),{value:s,state:s?"on":"off"}),x(l.probeTemp(d),{value:q.temp[i]+Math.sin((Te+d)/6)*.1})}let r=29.5+o*.075+t*.18+Math.sin(Te/6)*.25,n=r-(t?2.1+e/Math.max(1,t*50):1.1);x(a.flow,{value:Number(r.toFixed(1))}),x(a.ret,{value:Number(n.toFixed(1))}),x(l.probeTemp(7),{value:Number((n-.4).toFixed(1))}),x(l.probeTemp(8),{value:Number((r+.2).toFixed(1))}),Re(!0);let c=I("zoneStateHistory");c&&(c.uptime_s=Number(Date.now()/1e3)|0),Te%3===0&&eo(1)}function to(){Jt||(sr(),Ae(!0),Jt=setInterval(ir,1200))}function Qe(e){var c;let t=e.key||"",o=e.value,r=e.zone||0;if(t==="zone_setpoint"&&r>=1&&r<=ee){let i=Number(o);Number.isNaN(i)||(q.setpoint[r-1]=i,x(l.setpoint(r),{value:i}),O("Zone "+r+" setpoint set to "+i.toFixed(1)+"\xB0C",r));return}if(t==="zone_enabled"&&r>=1&&r<=ee){let i=o>.5;q.enabled[r-1]=i?1:0,x(l.enabled(r),{value:i,state:i?"on":"off"}),O("Zone "+r+(i?" enabled":" disabled"),r);return}if(t==="drivers_enabled"){let i=o>.5;q.driversEnabled=i?1:0,x(a.drivers,{value:i,state:i?"on":"off"}),O(i?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let i=o>.5;q.manualMode=i?1:0,Fe("manualMode",i);return}if(t==="motor_target"&&r>=1&&r<=ee){let i=Number(o||0);x(l.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(i)))}),O("Motor "+r+" target set to "+i+"%",r);return}if(t==="command"){let i=String(o);if(i==="i2c_scan"){Ne(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),O("I2C scan complete");return}if(i==="calibrate_all_motors"||i==="restart"){O("Command executed: "+i);return}if(i==="open_motor_timed"&&r>=1&&r<=ee){O("Motor "+r+" open timed",r);return}if(i==="close_motor_timed"&&r>=1&&r<=ee){O("Motor "+r+" close timed",r);return}if(i==="stop_motor"&&r>=1&&r<=ee){O("Motor "+r+" stopped",r);return}if(i==="motor_reset_fault"&&r>=1&&r<=ee){O("Motor "+r+" fault reset",r);return}if(i==="motor_reset_learned_factors"&&r>=1&&r<=ee){O("Motor "+r+" learned factors reset",r);return}if(i==="motor_reset_and_relearn"&&r>=1&&r<=ee){O("Motor "+r+" reset and relearn started",r);return}if(i==="dump_task_stats"){O("Task stats dumped to device log (mock)");return}if(i==="reset_balancing"){for(let d=1;d<=ee;d++)x(l.balanceAdapt(d),{value:1}),x(l.balanceFactor(d),{value:(c=S(l.staticFactor(d)))!=null?c:1}),x(l.adaptErr(d),{value:null});O("Adaptive balancing reset");return}return}if(t==="zone_probe"&&r>=1){x(l.probe(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_temp_source"&&r>=1){x(l.tempSource(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_sync_to"&&r>=1){x(l.syncTo(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_type"&&r>=1){x(l.pipeType(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="manifold_type"){x(a.manifoldType,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="manifold_flow_probe"){x(a.manifoldFlowProbe,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="manifold_return_probe"){x(a.manifoldReturnProbe,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="motor_profile_default"){x(a.motorProfileDefault,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="simple_preheat_enabled"){x(a.simplePreheatEnabled,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="minimum_flow_always"){x(a.minimumFlowAlways,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="balance_mode"){x(a.balanceMode,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="zone_name"&&r>=1){x(l.name(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_ble_mac"&&r>=1){x(l.ble(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_exterior_walls"&&r>=1){let i=String(o)||"None";x(l.exteriorWalls(r),{state:i});let d=i==="None"?0:i.split(",").filter(Boolean).length,s=[0,.5,.7,.85,1][Math.min(d,4)];x(l.windExposure(r),{value:s}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_area_m2"&&r>=1){x(l.area(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_spacing_mm"&&r>=1){x(l.spacing(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_wind_exposure"&&r>=1){x(l.windExposure(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_solar_gain"&&r>=1){x(l.solarGain(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_thermal_lead_h"&&r>=1){x(l.thermalLeadH(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}let n={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax,min_zone_flow_pct:a.minZoneFlowPct};if(n[t]){let i=Number(o);Number.isNaN(i)||(x(n[t],{value:i}),O("Setting updated: "+t+" = "+o));return}}window.__hv6_mock={setSetpoint(e,t){Qe({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!q.enabled[e-1];Qe({key:"zone_enabled",value:t?1:0,zone:e})}};var et="/api/hv6/v1";function tt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function ce(e,t,o){if(Vt(),tt())try{return Qe(o),Promise.resolve({ok:!0})}finally{_t()}let r=new URLSearchParams;for(let[i,d]of Object.entries(t||{}))d!=null&&r.append(i,d);let n=r.toString(),c=et+e+(n?"?"+n:"");return fetch(c,{method:"POST"}).then(i=>(i.ok||console.warn(`API call failed: POST ${e} status=${i.status}`),i)).catch(i=>{throw console.error(`API call error: POST ${e}:`,i),i}).finally(()=>{_t()})}function zt(e,t){return x(l.setpoint(e),{value:t}),ce(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function oo(e,t){return x(l.enabled(e),{state:t?"on":"off",value:t}),ce(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function ot(e){return x(a.drivers,{state:e?"on":"off",value:e}),ce("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function fe(e,t){return ce("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function ro(){return Ne("Scanning I2C bus..."),O("I2C scan started"),fe("i2c_scan")}var lr={zone_probe:e=>l.probe(e),zone_temp_source:e=>l.tempSource(e),zone_sync_to:e=>l.syncTo(e),zone_pipe_type:e=>l.pipeType(e)},cr={zone_ble_mac:e=>l.ble(e),zone_exterior_walls:e=>l.exteriorWalls(e),zone_name:e=>l.name(e)},dr={zone_area_m2:e=>l.area(e),zone_pipe_spacing_mm:e=>l.spacing(e)},pr={manifold_type:a.manifoldType,manifold_flow_probe:a.manifoldFlowProbe,manifold_return_probe:a.manifoldReturnProbe,motor_profile_default:a.motorProfileDefault,simple_preheat_enabled:a.simplePreheatEnabled,balance_mode:a.balanceMode},ur={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax};function De(e,t,o){let r=lr[t];return r&&x(r(e),{state:o}),ce("/settings/select",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function qe(e,t,o){let r=cr[t];return r&&x(r(e),{state:o}),ce("/settings/text",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function Oe(e,t,o){let r=Number(o),n=dr[t];return n&&!Number.isNaN(r)&&x(n(e),{value:r}),ce("/settings/number",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function de(e,t){let o=pr[e];return o&&x(o,{state:t}),ce("/settings/select",{key:e,value:t},{key:e,value:t})}function ne(e,t){let o=Number(t),r=ur[e];return r&&!Number.isNaN(o)&&x(r,{value:o}),ce("/settings/number",{key:e,value:o},{key:e,value:o})}function ao(e,t){return ce("/settings/text",{key:e,value:t},{key:e,value:t})}function no(e,t){let o=String(t||"").trim();return O("Zone "+e+" renamed to "+(o||"(blank)"),e),qe(e,"zone_name",o)}function so(e,t){let o=Number(t),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return x(l.motorTarget(e),{value:r}),O("Motor "+e+" target set to "+r+"%",e),ce(`/motors/${e}/target`,{value:r},{key:"motor_target",value:r,zone:e})}function io(e,t=1e4){return O("Motor "+e+" open for "+t+"ms",e),ce(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function lo(e,t=1e4){return O("Motor "+e+" close for "+t+"ms",e),ce(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function St(e){return O("Motor "+e+" stopped",e),ce(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function kt(e){return Fe("manualMode",!!e),O(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),ce("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function co(e){return O("Motor "+e+" fault reset",e),fe("motor_reset_fault",e)}function po(e){return O("Motor "+e+" learned factors reset",e),fe("motor_reset_learned_factors",e)}function uo(e){return O("Motor "+e+" reset and relearn started",e),fe("motor_reset_and_relearn",e)}function mo(){return O("Adaptive balancing reset \u2014 learned factors back to 1.0"),fe("reset_balancing")}function fo(){return O("Task stats dumped to device log"),fe("dump_task_stats")}function Et(){tt()||fetch(et+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Xe(e)}).catch(()=>{})}function Ct(){if(tt())return;let e=Ut();fetch(et+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Ue(t.lines,t.next_seq)}).catch(()=>{})}function Be(){tt()||fetch(et+"/forecast",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Ye(e)}).catch(()=>{})}var Lt=null,rt=null,go=null,bo=null,ho=null;async function mr(){rt&&rt.abort(),rt=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:rt.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function xo(e){if(!(!e||typeof e!="object")&&!Gt()){for(let t in e)x(t,e[t]);Re(!1)}}function fr(e){if(e){if(!e.type){xo(e);return}if(e.type==="state"){xo(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;O(t),String(t).indexOf("I2C_SCAN:")!==-1&&Ne(String(t))}}}function vo(){Lt||(Lt=setTimeout(()=>{Lt=null,Mt()},1e3))}function Mt(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){to();return}mr().then(t=>{Ae(!0),fr(t),Et(),go||(go=setInterval(Et,300*1e3)),Ct(),bo||(bo=setInterval(Ct,3e3)),Be(),ho||(ho=setInterval(Be,300*1e3)),vo()}).catch(()=>{Ae(!1),vo()})}var yo=Object.create(null);function F(e,t){if(yo[e])return;yo[e]=1;let o=document.createElement("style");o.textContent=t,document.head.appendChild(o)}var gr=`
/* ---- Card panel ---- */
.ui-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
}

/* ---- Titles & section headers ---- */
.ui-card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin: 0 0 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  overflow: visible;
}
.ui-title-text { display: inline-flex; align-items: center; }

/* ---- Help badge: a "?" chip with a hover/focus explanation tooltip ---- */
.help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 7px;
  border-radius: 999px;
  border: 1.5px solid rgba(180,180,180,.55);
  color: rgba(210,210,220,.9);
  font-size: .65rem;
  font-weight: 700;
  font-family: inherit;
  text-transform: none;
  letter-spacing: 0;
  cursor: help;
  position: relative;
  flex-shrink: 0;
  vertical-align: middle;
}
.help-badge:hover, .help-badge:focus-visible { color: var(--accent); border-color: var(--accent); outline: none; }
.help-badge .help-tip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: max-content;
  max-width: 240px;
  background: rgba(4,18,28,.97);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .72rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: .2px;
  text-align: left;
  white-space: normal;
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease;
  z-index: 60;
}
.help-badge:hover .help-tip, .help-badge:focus-visible .help-tip { opacity: 1; }

.ui-section {
  color: var(--text-secondary);
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin: 16px 0 2px;
}

/* ---- Row: label left, control right, divider below ---- */
.ui-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .9rem;
  font-weight: 600;
  line-height: 1.25;
  min-width: 0;
}
.ui-sublabel {
  display: block;
  color: var(--text-faint);
  font-size: .72rem;
  font-weight: 500;
  font-style: italic;
  margin-top: 2px;
}

.ui-field {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---- Controls ---- */
.ui-input {
  width: 96px;
  box-sizing: border-box;
  text-align: right;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.ui-input.wide { width: 180px; text-align: left; font-family: inherit; }

.ui-select {
  min-width: 160px;
  max-width: 240px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}

.ui-unit { color: var(--text-faint); font-size: .72rem; font-weight: 600; }

/* ---- Numeric stepper (\u2212 value +) ----
   The value reads as plain text (flat, no input chrome) between the buttons;
   double-clicking it reveals the editable input. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 54px;
  text-align: center;
  border-color: transparent;
  background: transparent;
  color: var(--accent);
  font-size: 1.04rem;
  font-weight: 700;
  cursor: default;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input.editing {
  border-color: var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: text;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: 32px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 9px;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.ui-step-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--control-bg-hover); }
.ui-step-btn:active { transform: translateY(1px); }

/* ---- Unsaved-changes banner (sits under the card title) ---- */
.ui-form-banner {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255,166,0,.12);
  border: 1px solid rgba(255,166,0,.42);
}
.ui-form-banner.show { display: flex; }
.ui-form-banner-msg { color: var(--state-warn); font-size: .76rem; font-weight: 700; }
.ui-form-banner-btns { display: flex; gap: 8px; flex-shrink: 0; }
.ui-form-discard,
.ui-form-apply {
  border-radius: 8px;
  padding: 5px 14px;
  font-size: .76rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: .15s ease;
}
.ui-form-discard { background: transparent; color: var(--text-secondary); }
.ui-form-discard:hover { color: var(--text); border-color: var(--text-secondary); }
.ui-form-apply { background: var(--accent); color: #042a3b; border-color: var(--accent); }
.ui-form-apply:hover { filter: brightness(1.08); }

/* ---- Green pill toggle (canonical) ---- */
.ui-toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}
.ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #efe6dd;
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on { background: rgba(121,209,126,.25); border-color: rgba(121,209,126,.5); }
.ui-toggle.on::after { transform: translateX(22px); background: #042a3b; }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .75rem;
  line-height: 1.4;
  margin-top: 8px;
}
.ui-divider {
  border: 0;
  border-top: 1px dashed var(--panel-border);
  margin: 14px 0 2px;
}

/* ---- Buttons (device actions / recovery) ---- */
.ui-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ui-btn {
  flex: 1;
  min-width: 120px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: .82rem;
  transition: .18s ease;
}
.ui-btn:hover { background: var(--control-bg-hover); border-color: rgba(120,146,200,.52); }
.ui-btn.warn { border-color: rgba(255,118,118,.5); background: rgba(255,118,118,.2); color: #FFD9D9; }
.ui-btn.warn:hover { background: rgba(255,100,100,.3); border-color: rgba(255,100,100,.6); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;F("ui-kit",gr);function ge(e){return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}">?<span class="help-tip">${e}</span></span>`}function br(e,t){let o=Math.abs(Number(e));return!Number.isFinite(o)||o<1e3?t:Math.pow(10,Math.floor(Math.log10(o))-1)}function hr(e){let t=String(e),o=t.indexOf(".");return o<0?0:t.length-o-1}function se(e,t={}){let o=e.querySelector(t.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard">Discard</button><button type="button" class="ui-form-apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):e.insertAdjacentElement("afterbegin",r);let n=[],c=()=>r.classList.toggle("show",n.some(p=>p.dirty)),i=(p,_)=>{p.dirty=_,c()};function d(p){return p.markDirty=()=>i(p,!0),n.push(p),p}function s(p,_){let k={dirty:!1,input:p},h=_.baseStep!=null?_.baseStep:parseFloat(p.step)||1,y=hr(h),C=_.min!=null?_.min:p.min!==""?parseFloat(p.min):-1/0,A=_.max!=null?_.max:p.max!==""?parseFloat(p.max):1/0,H=D=>y>0?Number(D).toFixed(y):String(Math.round(Number(D)));if(!_.nostep){let D=document.createElement("div");D.className="ui-stepper",p.parentNode.insertBefore(D,p);let E=document.createElement("button");E.type="button",E.className="ui-step-btn",E.textContent="\u2212",E.tabIndex=-1,E.setAttribute("aria-label","decrease");let M=document.createElement("button");M.type="button",M.className="ui-step-btn",M.textContent="+",M.tabIndex=-1,M.setAttribute("aria-label","increase"),D.appendChild(E),D.appendChild(p),D.appendChild(M),p.readOnly=!0;let L=W=>{if(p.disabled)return;let G=parseFloat(p.value);Number.isFinite(G)||(G=parseFloat(p.placeholder)),Number.isFinite(G)||(G=0);let te=Math.min(A,Math.max(C,G+W*br(G,h)));p.value=H(te),i(k,!0)};E.addEventListener("click",()=>L(-1)),M.addEventListener("click",()=>L(1)),p.addEventListener("dblclick",()=>{p.disabled||(p.readOnly=!1,p.classList.add("editing"),p.focus(),p.select())}),p.addEventListener("blur",()=>{p.readOnly=!0,p.classList.remove("editing")}),p.addEventListener("keydown",W=>{W.key==="Enter"&&p.blur()})}return p.addEventListener("input",()=>i(k,!0)),k.sync=()=>{let D=_.read();p.value=D!=null&&Number.isFinite(Number(D))?H(D):""},k.commit=()=>{let D=parseFloat(p.value);Number.isFinite(D)&&_.commit(Math.min(A,Math.max(C,D)))},d(k)}function u(p,_){let k={dirty:!1,input:p};return p.addEventListener("input",()=>i(k,!0)),k.sync=()=>{let h=_.read();p.value=h!=null?h:""},k.commit=()=>_.commit(p.value.trim()),d(k)}function g(p,_){let k={dirty:!1,input:p};return p.addEventListener("change",()=>i(k,!0)),k.sync=()=>{let h=_.read();h!=null&&(p.value=h)},k.commit=()=>_.commit(p.value),d(k)}function b(p,_){let k={dirty:!1,input:p,staged:!1},h=p.closest(".ui-row"),y=()=>{p.classList.toggle("on",k.staged),h&&h.classList.toggle("is-on",k.staged),p.setAttribute("aria-checked",k.staged?"true":"false"),_.onChange&&_.onChange(k.staged)};return p.addEventListener("click",()=>{k.staged=!k.staged,i(k,!0),y()}),k.sync=()=>{k.staged=!!_.read(),y()},k.commit=()=>_.commit(k.staged),d(k)}function v(p){let _={dirty:!1,sync:p.sync,commit:p.commit};return d(_)}let f=()=>n.forEach(p=>{!p.dirty&&p.sync&&p.sync()}),m=()=>{n.forEach(p=>{p.dirty&&(p.commit&&p.commit(),p.dirty=!1)}),c(),t.onApply&&t.onApply()},z=()=>{n.forEach(p=>{p.dirty=!1,p.sync&&p.sync()}),c(),t.onDiscard&&t.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",m),r.querySelector(".ui-form-discard").addEventListener("click",z),{num:s,text:u,select:g,toggle:b,custom:v,refresh:f,apply:m,discard:z,isDirty:()=>n.some(p=>p.dirty)}}function ue(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function at(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function nt(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,o=e%86400/3600|0,r=e%3600/60|0;return t>0?t+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function wo(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var xr=`
.topbar {
  position: static;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg-vibrant);
  box-shadow: var(--panel-shadow);
  display: grid;
  gap: 10px;
}

.topbar-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.top-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-self: center;
  gap: 4px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-brand {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  white-space: nowrap;
}

.top-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 7px;
}

.menu-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid var(--control-border);
  background: linear-gradient(180deg, rgba(0,63,92,.54), rgba(0,32,46,.46));
  border-radius: 11px;
  padding: 10px 12px;
  font-size: .78rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: .8px;
  transition: .2s ease;
}

.menu-link:hover {
  color: var(--text-strong);
  background: linear-gradient(180deg, rgba(0,84,120,.64), rgba(0,63,92,.54));
  border-color: rgba(120,146,200,.52);
}

.menu-link.active {
  color: var(--text-on-accent);
  border-color: var(--accent);
  background: var(--accent);
}

.top-meta {
  display: grid;
  justify-items: end;
  row-gap: 4px;
  color: var(--muted);
  font-size: .74rem;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.meta-chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 34px;
  padding: 4px 10px;
  border-radius: 14px;
  border: 1px solid rgba(120,146,200,.32);
  background: linear-gradient(180deg, rgba(0,63,92,.52), rgba(0,32,46,.42));
}

.meta-chip-label {
  text-transform: uppercase;
  letter-spacing: .6px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-secondary);
}

.meta-chip-value {
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-strong);
}

.meta-chip-state.synced {
  color: var(--state-ok);
  border-color: rgba(121,209,126,.25);
  background: linear-gradient(180deg, rgba(20,52,34,.46), rgba(13,39,27,.36));
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: rgba(255,133,49,.35);
  background: linear-gradient(180deg, rgba(83,56,20,.46), rgba(58,37,12,.36));
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: rgba(120,146,200,.24);
  background: linear-gradient(180deg, rgba(0,63,92,.34), rgba(0,32,46,.28));
}

.brand-fw {
  min-height: 12px;
  font-size: .62rem;
  letter-spacing: .7px;
  color: var(--text-secondary);
  font-family: var(--mono);
  text-transform: uppercase;
}

.top-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--state-disabled);
  transition: .2s ease;
}

.top-dot.on {
  background: var(--state-ok);
  box-shadow: 0 0 12px rgba(121,209,126,.55);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  /* Stat pills (uptime / wifi / heat source) ride to the very top, above brand + menu. */
  .top-meta { order: -2; justify-items: center; }
  .top-brand { order: -1; justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;F("hv6-header",xr);var vr=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview">Monitor</a>
        <a href="#" class="menu-link" data-section="zones">Zones</a>
        <a href="#" class="menu-link" data-section="settings">Settings</a>
        <a href="#" class="menu-link" data-section="logs">Logs</a>
      </nav>
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">HeatValve-6</div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
          <span class="meta-chip" id="hdr-asgard" hidden><span class="meta-chip-label">Heat Src</span><span class="meta-chip-value" id="hdr-asgard-val">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,es=T({tag:"hv6-header",render:vr,onMount(e,t){let o=t.querySelector("#hdr-dot"),r=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),c=t.querySelector("#hdr-wifi"),i=t.querySelector("#hdr-asgard"),d=t.querySelector("#hdr-asgard-val"),s=t.querySelector("#hdr-fw"),u=t.querySelectorAll(".menu-link");function g(){let v=I("section");u.forEach(f=>{f.classList.toggle("active",f.getAttribute("data-section")===v)})}function b(){let v=I("live"),f=I("pendingWrites"),m=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);o.classList.toggle("on",!!v);let z,p;f>0?(z="Saving\u2026",p="saving"):m?(z=window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock",p="synced"):v?(z="Live",p="synced"):(z="Offline",p="offline"),r.textContent=z,r.className="meta-chip meta-chip-state "+p,n.textContent=nt(S(a.uptime)),c.textContent=wo(S(a.wifi));let _=S(a.asgardLastPushC),k=U(a.asgardEnabled)&&_!=null&&Number.isFinite(_);i.hidden=!k,k&&(d.textContent=_.toFixed(2)+"\xB0C");let h=I("firmwareVersion")||N(a.firmware);s.textContent=h?"FW "+h:""}u.forEach(v=>{v.addEventListener("click",f=>{f.preventDefault(),Zt(v.getAttribute("data-section"))})}),R("section",g),R("live",b),R("pendingWrites",b),R("firmwareVersion",b),w(a.uptime,b),w(a.wifi,b),w(a.asgardLastPushC,b),w(a.asgardEnabled,b),w(a.firmware,b),g(),b()}});var yr=`
.status-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  min-width: 220px;
}
.status-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.status-card .st {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-strong);
}
.status-card .st td {
  padding: 6px 0;
  font-size: 1rem;
}
.status-card .st tr:not(:last-child) td {
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.status-card .drv-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-card .sw {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--state-danger);
  border: 1px solid rgba(255,100,100,.3);
  cursor: pointer;
  margin-left: 6px;
  position: relative;
  flex-shrink: 0;
  transition: background .2s ease, border-color .2s ease;
}
.status-card .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: #efe6dd;
  border-radius: 999px;
  transition: .2s ease;
}
.status-card .sw.on {
  background: var(--blue);
  border-color: rgba(124,155,208,.4);
}
.status-card .sw.on::after {
  transform: translateX(16px);
  background: #042a3b;
}
.status-card .sw.off {
  background: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}
.status-card .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(120,146,200,.35);
  transition: .2s ease;
  flex-shrink: 0;
  display: inline-block;
}
.status-card .dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(124,155,208,.55);
}
`;F("status-card",yr);var wr=e=>`
  <div class="card status-card">
    <div class="card-title">Status</div>
    <table class="st">
      <tr>
        <td>Motor Drivers</td>
        <td>
          <div class="drv-toggle">
            <span id="sys-drv">${e.motorDrivers}</span>
            <div class="sw ${e.motorDriversOn?"on":"off"}" id="sw-drv"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td>Motor Fault</td>
        <td id="sys-fault">${e.motorFault}</td>
      </tr>
      <tr>
        <td>Connection</td>
        <td id="sys-conn"><span class="dot ${e.connOn?"on":""}" id="sys-dot"></span></td>
      </tr>
    </table>
  </div>
`,is=T({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:wr,methods:{update(e){this.motorDriversOn=U(a.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=U(a.fault)?"FAULT":"OK",this.connOn=I("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let o={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},r=()=>e.update(o);w(a.drivers,r),w(a.fault,r),R("live",r),o.sw.onclick=()=>{ot(!e.motorDriversOn)},r()}});var _r=`
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.connectivity-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.connectivity-card .st { width: 100%; border-collapse: collapse; }
.connectivity-card .st td { padding: 7px 0; font-size: .92rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 42%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); font-family: var(--mono); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;F("connectivity-card",_r);var zr=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,fs=T({tag:"connectivity-card",render:zr,onMount(e,t){let o=t.querySelector(".cc-ip"),r=t.querySelector(".cc-ssid"),n=t.querySelector(".cc-mac"),c=t.querySelector(".cc-up");function i(){o.textContent=N(a.ip)||"---",r.textContent=N(a.ssid)||"---",n.textContent=N(a.mac)||"---",c.textContent=nt(S(a.uptime))}w(a.ip,i),w(a.ssid,i),w(a.mac,i),w(a.uptime,i),i()}});var Sr="http://www.w3.org/2000/svg",kr=`
.chart-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;        /* tooltip anchor */
}

.chart-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
}
.chart-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
}
.chart-title {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.chart-head .chart-sub {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .4px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .3px;
}
.chart-legend-marker {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 32%, transparent);
  flex-shrink: 0;
}

.chart-card svg { width: 100%; height: auto; display: block; overflow: visible; }
.chart-grid { stroke: rgba(150,168,205,.14); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-axis { stroke: rgba(150,168,205,.34); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-tick { fill: var(--chart-axis); font-size: 11px; opacity: .85; }
.chart-axis-label {
  fill: var(--chart-axis); font-size: 9px; letter-spacing: .8px;
  text-transform: uppercase; opacity: .75;
}
/* matches the zone-state-history axis labels: small, non-bold, faint blue */
.chart-hour { fill: rgba(202,219,248,.78); font-size: 9px; font-weight: 400; }
.chart-hour.now { fill: var(--series-solar); }
.chart-hour.day2 { fill: rgba(202,219,248,.5); }
.chart-empty { fill: var(--text-faint); font-size: 12px; letter-spacing: .3px; }

/* hover cursor + tooltip */
.chart-cursor-line { stroke: rgba(233,222,210,.45); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.chart-cursor-dot { stroke: var(--card); stroke-width: 1.5; }
.chart-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  background: rgba(4,18,28,.94);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 7px 9px;
  font-size: .7rem;
  color: var(--text-strong);
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  white-space: nowrap;
  opacity: 0;
  transition: opacity .1s ease;
}
.chart-tooltip.show { opacity: 1; }
.chart-tooltip .tt-time { font-weight: 800; letter-spacing: .4px; margin-bottom: 4px; color: var(--text-strong); }
.chart-tooltip .tt-row { display: flex; align-items: center; gap: 6px; line-height: 1.5; }
.chart-tooltip .tt-swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.chart-tooltip .tt-val { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 700; }
`;F("chart-kit",kr);function $(e,t,o){let r=document.createElementNS(Sr,e);if(t)for(let n in t)r.setAttribute(n,t[n]);return o!=null&&(r.textContent=o),r}function Pe(e){if(!e.length)return"";if(e.length<3)return"M "+e.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let t=.16,o=`M ${e[0].x.toFixed(2)} ${e[0].y.toFixed(2)}`;for(let r=0;r<e.length-1;r++){let n=e[r-1]||e[r],c=e[r],i=e[r+1],d=e[r+2]||i,s=c.x+(i.x-n.x)*t,u=c.y+(i.y-n.y)*t,g=i.x-(d.x-c.x)*t,b=i.y-(d.y-c.y)*t;o+=` C ${s.toFixed(2)} ${u.toFixed(2)}, ${g.toFixed(2)} ${b.toFixed(2)}, ${i.x.toFixed(2)} ${i.y.toFixed(2)}`}return o}function _o(e,t,o){let r=e.filter(d=>Number.isFinite(d));if(!r.length)return{min:t,max:o};let n=Math.min(...r),c=Math.max(...r);n===c&&(n-=1,c+=1);let i=(c-n)*.12;return{min:n-i,max:c+i}}function st(e,t,o){let r=document.createElement("div");r.className="chart-tooltip",t.appendChild(r);let n=$("g",{class:"chart-cursor",style:"display:none"}),c=$("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});n.appendChild(c);let i=[];e.appendChild(n);function d(b){let v=0,f=1/0;for(let m=0;m<o.count;m++){let z=Math.abs(b-o.xAt(m));z<f&&(f=z,v=m)}return v}function s(b){let v=e.getScreenCTM();if(!v)return null;let f=e.createSVGPoint();return f.x=b.clientX,f.y=b.clientY,f.matrixTransform(v.inverse())}function u(b){if(!o.count)return;let v=s(b);if(!v)return;let f=d(v.x),m=o.xAt(f);c.setAttribute("x1",m),c.setAttribute("x2",m);let z=o.dots(f);for(;i.length<z.length;){let h=$("circle",{class:"chart-cursor-dot",r:3.4});n.appendChild(h),i.push(h)}i.forEach((h,y)=>{y<z.length?(h.setAttribute("cx",m),h.setAttribute("cy",z[y].y),h.setAttribute("fill",z[y].color),h.style.display=""):h.style.display="none"}),n.style.display="";let p=o.rows(f).map(h=>`<div class="tt-row"><span class="tt-swatch" style="background:${h.color}"></span>${h.label}<span class="tt-val">${h.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(f)}</div>${p}`,r.classList.add("show");let _=t.getBoundingClientRect(),k=b.clientX-_.left+14;k+r.offsetWidth>_.width-6&&(k=b.clientX-_.left-r.offsetWidth-14),r.style.left=Math.max(6,k)+"px",r.style.top=Math.max(6,b.clientY-_.top+12)+"px"}function g(){r.classList.remove("show"),n.style.display="none"}return e.addEventListener("pointermove",u),e.addEventListener("pointerleave",g),()=>{e.removeEventListener("pointermove",u),e.removeEventListener("pointerleave",g),r.remove()}}var Ie=1e3,Ft=180,he=14,Er=42,Cr=44,ze=42,ct=Ie-ze-Er,_e=Ft-he-Cr,Le=he+_e,At=24*3600,zo=re+2,So=re+3,it=re+4,Lr="var(--series-warm)",Mr="var(--series-cool)",ko="var(--series-solar)",Fr=`
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(138,80,143,.10), rgba(0,32,46,.34));
}
.graph-widgets .gw-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.graph-widgets .gw-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease, opacity .14s ease;
}
.graph-widgets .gw-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.graph-widgets .gw-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.graph-widgets .gw-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.graph-widgets .gw-toggle[data-layer="flow"] { color: var(--series-warm); }
.graph-widgets .gw-toggle[data-layer="return"] { color: var(--series-cool); }
.graph-widgets .gw-toggle[data-layer="demand"] { color: var(--series-solar); }
`;F("graph-widgets",Fr);var Eo=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true">Demand</button></div><svg class="gw-flow"></svg></div>',Co=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Ar=e=>e.variant==="flow-return"?`<div class="graph-widgets">${Eo()}</div>`:e.variant==="demand"?`<div class="graph-widgets">${Co()}</div>`:`<div class="graph-widgets">${Eo()}${Co()}</div>`;function Lo(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1):"\u2014"}function Nr(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"\xB0":"\u2014"}function Nt(e,t,o){let r=[];for(let n=0;n<e.length;n++){let c=e[n];if(!c||c[0]<o)continue;let i=c[t];i==null||!Number.isFinite(i)||r.push({t:c[0],v:i})}return r}var dt=(e,t)=>ze+Math.max(0,Math.min(1,(e-t)/At))*ct;function Tr(e,t,o){let r=Number(Date.now()/1e3)|0,n=3600,c=Math.ceil((r-At)/n)*n,i=Math.floor(r/n)*n,d=Math.floor(r/n)*n;for(let u=c;u<=i;u+=n){let g=o-(r-u),b=dt(g,t),v=new Date(u*1e3),f=u===d,m=Le+16;e.appendChild($("text",{x:b,y:m,"text-anchor":"end",transform:`rotate(-45 ${b.toFixed(1)} ${m})`,class:"chart-hour"+(f?" now":"")},String(v.getHours()).padStart(2,"0")))}let s=dt(o,t);e.appendChild($("line",{x1:s,y1:he,x2:s,y2:Le,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Dr(e){let t=[];if(e.forEach(c=>c.forEach(i=>t.push(i.v))),!t.length)return{min:0,max:10};let o=Math.min(...t),r=Math.max(...t);o===r&&(o-=.5,r+=.5);let n=(r-o)*.1;return o-=n,r+=n,{min:o,max:r}}function Or(e,t,o){let r=e.filter(n=>n.unit==="C").map(n=>Nt(t,n.index,o));return Dr(r)}function Mo(e,t,o,r,n,c){e.innerHTML="",e.setAttribute("viewBox",`0 0 ${Ie} ${Ft}`),e.setAttribute("preserveAspectRatio","xMidYMid meet");let i=o.map(m=>Nt(r,m.index,n));if(!i.some(m=>m.length))return e.appendChild($("text",{x:Ie/2,y:Ft/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let d=Or(o,r,n),s=Math.max(.001,d.max-d.min),u=m=>he+(1-(m-d.min)/s)*_e,g=m=>he+(1-Math.max(0,Math.min(100,m))/100)*_e,b=(m,z)=>m.unit==="%"?g(z):u(z);for(let m=0;m<3;m++){let z=m/2,p=he+z*_e;e.appendChild($("line",{x1:ze,y1:p,x2:ze+ct,y2:p,class:"chart-grid"})),o.some(_=>_.unit==="C")&&e.appendChild($("text",{x:ze-6,y:p+4,"text-anchor":"end",class:"chart-tick"},Lo(d.max-s*z,"C")+"\xB0")),o.some(_=>_.unit==="%")&&e.appendChild($("text",{x:ze+ct+6,y:p+4,"text-anchor":"start",class:"chart-tick"},Lo(100-100*z,"%")))}e.appendChild($("line",{x1:ze,y1:Le,x2:ze+ct,y2:Le,class:"chart-axis"})),o.some(m=>m.unit==="C")&&e.appendChild($("text",{x:9,y:he+_e/2,transform:`rotate(-90 9 ${(he+_e/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"Temp")),o.some(m=>m.unit==="%")&&e.appendChild($("text",{x:Ie-9,y:he+_e/2,transform:`rotate(90 ${Ie-9} ${(he+_e/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"Demand")),Tr(e,n,c),o.forEach((m,z)=>{let p=i[z].map(k=>({x:dt(k.t,n),y:b(m,k.v)}));if(!p.length)return;let _=Pe(p);m.fill&&e.appendChild($("path",{d:_+` L ${p[p.length-1].x.toFixed(1)} ${Le} L ${p[0].x.toFixed(1)} ${Le} Z`,fill:m.fill,stroke:"none"})),e.appendChild($("path",{d:_,fill:"none",stroke:m.color,"stroke-width":String(m.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let v=[];for(let m=0;m<r.length;m++){let z=r[m];if(!z||z[0]<n)continue;let p=o.map(_=>z[_.index]);p.every(_=>_==null||!Number.isFinite(_))||v.push({t:z[0],vals:p})}if(!v.length)return null;let f=Date.now();return st(e,t,{count:v.length,plotTop:he,plotBottom:Le,xAt:m=>dt(v[m].t,n),label:m=>new Date(f-(c-v[m].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:m=>o.map((z,p)=>({y:b(z,v[m].vals[p]),color:z.color})).filter((z,p)=>Number.isFinite(v[m].vals[p])),rows:m=>o.map((z,p)=>({color:z.color,label:z.label,value:Nr(v[m].vals[p],z.unit)})).filter((z,p)=>Number.isFinite(v[m].vals[p]))})}function lt(e,t,o){let r=Nt(e,t,o);return r.length?r[r.length-1].v:null}var _s=T({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:Ar,onMount(e,t){let o=t.querySelector(".gw-dt"),r=t.querySelector(".gw-demand-text"),n=t.querySelector(".gw-flow"),c=t.querySelector(".gw-demand"),i=Array.from(t.querySelectorAll(".gw-toggle")),d={flow:!0,return:!0,demand:!0},s=null,u=null;function g(){i.forEach(f=>{let m=f.dataset.layer;f.classList.toggle("is-off",!d[m]),f.setAttribute("aria-pressed",d[m]?"true":"false")})}function b(){let f=[];return d.flow&&f.push({index:zo,color:Lr,label:"Flow",unit:"C",width:2.4}),d.return&&f.push({index:So,color:Mr,label:"Return",unit:"C",width:2}),d.demand&&f.push({index:it,color:ko,label:"Demand",unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function v(){let f=I("zoneStateHistory"),m=f&&Array.isArray(f.entries)?f.entries:[],z=f&&f.uptime_s||Number(Date.now()/1e3)|0,p=z-At;if(n){s&&s();let _=lt(m,zo,p),k=lt(m,So,p),h=lt(m,it,p),y=[];_!=null&&k!=null&&y.push("\u0394 "+(_-k).toFixed(1)+"\xB0"),h!=null&&y.push(Math.round(h)+"%"),o.textContent=y.length?y.join(" \xB7 "):"\u2014",s=Mo(n,n.closest(".chart-card"),b(),m,p,z)}if(c){u&&u();let _=lt(m,it,p);r.textContent=_!=null?Math.round(_)+"%":"\u2014",u=Mo(c,c.closest(".chart-card"),[{index:it,color:ko,label:"Demand",unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],m,p,z)}}i.forEach(f=>{f.addEventListener("click",()=>{let m=f.dataset.layer;d[m]=!d[m],!d.flow&&!d.return&&!d.demand&&(d[m]=!0),g(),v()})}),R("zoneStateHistory",v),g(),v()}});var Pr=.5;function Hr(e){let t=String(e||"").toUpperCase(),o=0;return t.includes("N")&&(o|=1),t.includes("E")&&(o|=2),t.includes("S")&&(o|=4),t.includes("W")&&(o|=8),o}function Rr(e,t){let o=[[1,0],[2,90],[4,180],[8,270]],r=0;for(let[n,c]of o){if(!(e&n))continue;let i=(Number(t)-c)*Math.PI/180;r=Math.max(r,Math.cos(i))}return Math.max(0,r)}function qr(e,t){let o=Hr(N(l.exteriorWalls(t)));if(!o)return 0;let r=Number(S(l.windExposure(t))),n=Number(S(l.solarGain(t))),c=Number.isFinite(r)?r:.5,i=Number.isFinite(n)?n:.3,d=Rr(o,e[2]),s=c*d*(Number(e[1])/10),u=Math.max(0,21-Number(e[0]))/10,g=i*(Math.max(0,Number(e[3])||0)/800);return Math.max(0,s*u-g)}function Fo(e,t){let o=Math.min(t||(e?e.length:0),e?e.length:0),r=Number(S(a.forecastLoadThreshold)),n=Number(S(a.forecastMaxOffsetC)),c=Number.isFinite(r)?r:1,i=Number.isFinite(n)?n:1.5,d=[];for(let s=1;s<=6;s++){let u=Number(S(l.thermalLeadH(s))),g=Math.max(0,Math.min(24,Number.isFinite(u)?Math.round(u):4)),b=[];for(let v=0;v<o;v++){let f=Math.min(o-1,v+g),m=0;for(let p=v;p<=f;p++)m=Math.max(m,qr(e[p],s));let z=m-c;b.push(z>0?Math.min(i,z*Pr):0)}d.push({zone:s,offsets:b})}return d}function Ao(e,t){e(a.forecastLoadThreshold,t),e(a.forecastMaxOffsetC,t);for(let o=1;o<=6;o++)e(l.exteriorWalls(o),t),e(l.windExposure(o),t),e(l.solarGain(o),t),e(l.thermalLeadH(o),t)}var xe={0:{label:"Off",color:"#2c4875"},1:{label:"Manual",color:"#d07bb5"},2:{label:"Calibrating",color:"#ffd380"},3:{label:"Wait Cal.",color:"#6B5C84"},4:{label:"Wait Temp",color:"#6B5C84"},5:{label:"Heating",color:"#ff8531"},6:{label:"Idle",color:"#39354c"},7:{label:"Overheated",color:"#ff6361"},255:{label:"",color:"transparent"}},$e=24*3600,pt=12*3600,Br=$e+pt,Me=18,Ht=4,Se=54,Ze=32,ke=4,ut=10,To=6,Do="#bc5090",Oo="#ffa600",Ir=.5,Tt=9,Dt=6,Ot=2,No=re+1,Po=ke+re*(Me+Ht)-Ht,Pt=Po+To,We=Po+To+ut+Ze,Wr=`
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
}

.timeline-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}
.timeline-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
}
.timeline-head span {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.timeline-head strong {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .70rem;
  font-weight: 600;
  letter-spacing: .4px;
  text-transform: none;
}

.timeline-svg {
  width: 100%;
  display: block;
  border-radius: 10px;
  overflow: visible;
}

.timeline-empty {
  color: var(--text-faint);
  font-size: .78rem;
  padding: 12px 0;
  text-align: center;
  letter-spacing: .3px;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .67rem;
  color: var(--text-secondary);
  letter-spacing: .3px;
}

.tl-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
}

.tl-legend-dot.expected {
  width: 14px;
  height: 4px;
  opacity: .55;
  border-radius: 999px;
}
`;F("zone-state-timeline",Wr);var $r=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State</span>
      <strong>-24 h / +12 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Zr(e,t,o){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,n=e.uptime_s||t||0,c=Number(Date.now()/1e3)|0,i=1e3,d=i-Se;function s(E){let M=(E+$e)/Br;return Se+Math.max(0,Math.min(1,M))*d}function u(E){return E-n}let g="http://www.w3.org/2000/svg",b=document.createElementNS(g,"svg");b.setAttribute("viewBox","0 0 "+i+" "+We),b.classList.add("timeline-svg");let v=document.createElementNS(g,"rect");v.setAttribute("x",Se),v.setAttribute("y",ke),v.setAttribute("width",d),v.setAttribute("height",We-ke-Ze),v.setAttribute("fill","rgba(0,32,46,0.55)"),v.setAttribute("rx","4"),b.appendChild(v);let f=s(0),m=document.createElementNS(g,"rect");m.setAttribute("x",f),m.setAttribute("y",ke),m.setAttribute("width",Se+d-f),m.setAttribute("height",We-ke-Ze),m.setAttribute("fill","rgba(255,166,0,0.035)"),b.appendChild(m);let z=[-24,-18,-12,-6,0,6,12].map(E=>E*3600);for(let E of z){let M=s(E),L=document.createElementNS(g,"line");L.setAttribute("x1",M),L.setAttribute("y1",ke),L.setAttribute("x2",M),L.setAttribute("y2",We-Ze),L.setAttribute("stroke",E===0?"var(--series-solar)":"rgba(120,146,200,.16)"),L.setAttribute("stroke-width","1"),E===0&&(L.setAttribute("stroke-dasharray","2 3"),L.setAttribute("opacity",".55"),L.setAttribute("vector-effect","non-scaling-stroke")),b.appendChild(L)}b.appendChild(jr(g,"text",{x:f+4,y:ke+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));let p=(()=>{let E=o&&Array.isArray(o.hours)?o.hours:[];return!E.length||!o.base_epoch?[]:Fo(E,o.count||E.length)})(),_=p.reduce((E,M)=>{for(let L of M.offsets)E=Math.max(E,Number(L)||0);return E},0);function k(E){if(!U(l.enabled(E))||!U(a.drivers))return 0;let M=String(N(l.state(E))||"").toUpperCase();return M==="MANUAL"?1:M==="CALIBRATING"?2:M==="WAITING_CALIBRATION"?3:M==="WAITING_ROOM_TEMP"||M==="UNKNOWN"?4:M==="HEATING"?5:M==="IDLE"?6:M==="OVERHEATED"?7:6}function h(E,M){let L=k(E);if(L<=4||L===7)return L;let W=Number(S(l.temp(E))),G=Number(S(l.setpoint(E)));if(!Number.isFinite(W)||!Number.isFinite(G))return 4;let te=Number(S(l.preheatAdvance(E))),X=Number.isFinite(te)?Math.max(0,te):0,Q=G+Math.max(0,Number(M)||0)-Ir+X;return W<Q?5:6}for(let E=0;E<re;E++){let M=ke+E*(Me+Ht),L=document.createElementNS(g,"rect");L.setAttribute("x",Se),L.setAttribute("y",M),L.setAttribute("width",d),L.setAttribute("height",Me),L.setAttribute("fill",E%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),b.appendChild(L);let W=document.createElementNS(g,"text");W.setAttribute("x",Se-4),W.setAttribute("y",M+Me/2+1),W.setAttribute("text-anchor","end"),W.setAttribute("dominant-baseline","middle"),W.setAttribute("fill","rgba(233,222,210,.62)"),W.setAttribute("font-size","9.5"),W.setAttribute("font-family","Montserrat, sans-serif"),W.setAttribute("font-weight","600"),W.textContent="Z"+(E+1),b.appendChild(W);let G=r.map(J=>({rel:u(J[0]),state:J[E+1]})).filter(J=>J.rel>=-$e&&J.rel<=0),te=(J,Q,K)=>{if(K===255)return;let V=xe[K]||xe[255];if(V.color==="transparent")return;let be=s(J),ie=s(Q),le=Math.max(1,ie-be),me=document.createElementNS(g,"rect");me.setAttribute("x",be),me.setAttribute("y",M+(Me-Tt)/2),me.setAttribute("width",le),me.setAttribute("height",Tt),me.setAttribute("fill",V.color),me.setAttribute("rx",String(Tt/2)),me.setAttribute("opacity","0.9"),b.appendChild(me)};if(G.length){let J=G[0].rel,Q=G[0].state;for(let K=1;K<G.length;K++){let V=G[K];V.state!==Q&&(te(J,V.rel,Q),J=V.rel,Q=V.state)}te(J,0,Q)}let X=p[E];if(X&&o&&o.base_epoch){let J=[],Q=[];for(let K=0;K<X.offsets.length;K++){let V=Number(X.offsets[K])||0,be=o.base_epoch+K*3600-c,ie=be+3600;if(ie<=0||be>=pt)continue;let le=Math.max(0,be),me=Math.min(pt,ie),It=h(E+1,V),je=J[J.length-1];if(je&&je.state===It&&Math.abs(je.end-le)<2?je.end=me:J.push({start:le,end:me,state:It}),V>0&&_>0){let He=Q[Q.length-1];He&&Math.abs(He.end-le)<2?(He.end=me,He.peak=Math.max(He.peak,V)):Q.push({start:le,end:me,peak:V})}}for(let K of J){let V=xe[K.state]||xe[255];if(!V||V.color==="transparent")continue;let be=s(K.start),ie=s(K.end),le=document.createElementNS(g,"rect");le.setAttribute("x",be),le.setAttribute("y",M+(Me-Dt)/2),le.setAttribute("width",Math.max(1,ie-be)),le.setAttribute("height",Dt),le.setAttribute("fill",V.color),le.setAttribute("rx",String(Dt/2)),le.setAttribute("opacity",K.state===5?"0.50":"0.34"),b.appendChild(le)}for(let K of Q){let V=s(K.start),be=s(K.end),ie=document.createElementNS(g,"rect");ie.setAttribute("x",V+1),ie.setAttribute("y",M+Me-Ot-2),ie.setAttribute("width",Math.max(1,be-V-2)),ie.setAttribute("height",String(Ot)),ie.setAttribute("fill",Oo),ie.setAttribute("rx",String(Ot/2)),ie.setAttribute("opacity",String(Math.min(.82,.26+K.peak/_*.48))),b.appendChild(ie)}}}{let E=document.createElementNS(g,"rect");E.setAttribute("x",Se),E.setAttribute("y",Pt),E.setAttribute("width",d),E.setAttribute("height",ut),E.setAttribute("fill","rgba(188,80,144,0.10)"),E.setAttribute("rx","2"),b.appendChild(E);let M=document.createElementNS(g,"text");M.setAttribute("x",Se-4),M.setAttribute("y",Pt+ut/2+1),M.setAttribute("text-anchor","end"),M.setAttribute("dominant-baseline","middle"),M.setAttribute("fill","rgba(233,222,210,.62)"),M.setAttribute("font-size","8.5"),M.setAttribute("font-family","Montserrat, sans-serif"),M.setAttribute("font-weight","600"),M.textContent="Absorb",b.appendChild(M);let L=r.map(W=>({rel:u(W[0]),on:W.length>No?W[No]:0})).filter(W=>W.rel>=-$e&&W.rel<=0);if(L.length){let W=(X,J)=>{let Q=s(X),K=Math.max(1,s(J)-Q),V=document.createElementNS(g,"rect");V.setAttribute("x",Q),V.setAttribute("y",Pt),V.setAttribute("width",K),V.setAttribute("height",ut),V.setAttribute("fill",Do),V.setAttribute("rx","2"),V.setAttribute("opacity","0.9"),b.appendChild(V)},G=L[0].rel,te=L[0].on;for(let X=1;X<L.length;X++)L[X].on!==te&&(te&&W(G,L[X].rel),G=L[X].rel,te=L[X].on);te&&W(G,0)}}let y=We-Ze+15,C=3600,A=Math.ceil((c-$e)/C)*C,H=Math.floor((c+pt)/C)*C,D=Math.floor(c/C)*C;for(let E=A;E<=H;E+=C){let M=E-c,L=s(M),W=new Date(E*1e3),G=String(W.getHours()).padStart(2,"0"),te=E===D,X=document.createElementNS(g,"text");X.setAttribute("x",L),X.setAttribute("y",y),X.setAttribute("text-anchor","end"),X.setAttribute("fill",te?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),X.setAttribute("font-size","9"),X.setAttribute("font-family","Montserrat, sans-serif"),X.setAttribute("transform",`rotate(-45 ${L.toFixed(1)} ${y})`),X.textContent=G,b.appendChild(X)}return b}function jr(e,t,o,r){let n=document.createElementNS(e,t);for(let c in o)n.setAttribute(c,o[c]);return r!=null&&(n.textContent=r),n}function Vr(e){e.innerHTML="";let t=[{code:5,...xe[5]},{code:6,...xe[6]},{code:0,...xe[0]},{code:1,...xe[1]},{code:7,...xe[7]},{code:2,...xe[2]}];for(let c of t){let i=document.createElement("div");i.className="tl-legend-item",i.innerHTML='<span class="tl-legend-dot" style="background:'+c.color+'"></span>'+c.label,e.appendChild(i)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Do+'"></span>Preheat absorption',e.appendChild(o);let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot expected" style="background:'+xe[5].color+'"></span>Expected state',e.appendChild(r);let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+Oo+'"></span>Preload boost',e.appendChild(n)}var Ns=T({tag:"zone-state-timeline",render:$r,onMount(e,t){let o=t.querySelector(".tl-body"),r=t.querySelector(".timeline-legend");Vr(r);function n(){let c=I("zoneStateHistory"),i=Ke(),d=(()=>{let u=I&&I("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!c||!c.entries||c.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent="No history yet \u2014 data accumulates every 5 minutes.",o.appendChild(u);return}let s=Zr(c,d,i);s&&o.appendChild(s)}R("zoneStateHistory",n),R("zoneNames",n),R("forecastHours",n),Ao(w,n),w(a.drivers,n);for(let c=1;c<=re;c++)w(l.enabled(c),n),w(l.state(c),n),w(l.temp(c),n),w(l.setpoint(c),n),w(l.preheatAdvance(c),n);n()}});var Gr=`
.zone-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 14px;
}

@media (max-width: 720px) {
    .zone-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 560px) {
    .zone-grid { grid-template-columns: repeat(2, 1fr); }
}
`;F("zone-grid",Gr);var Xr=()=>'<div class="zone-grid"></div>',Ps=T({tag:"zone-grid",render:Xr,onMount(e,t){for(let o=1;o<=6;o++)t.appendChild(Z("zone-card",{zone:o}))}});var Ur=`
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 12px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,146,200,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(124,155,208,.42);
	border-left-color: rgba(124,155,208,.7);
	background: linear-gradient(180deg, rgba(28,58,103,.52), rgba(18,39,72,.46));
}
.zone-card.active {
	border-color: rgba(255,133,49,.44);
	border-left-color: rgba(255,133,49,.84);
	background: linear-gradient(180deg, rgba(255,133,49,.12), rgba(255,133,49,.04));
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,146,200,.35);
}

.zone-card.zs-heating { border-left-color: #ff8531; }
.zone-card.zs-idle { border-left-color: #8a508f; }
.zone-card.zs-fault { border-left-color: #ff6361; }
.zone-card.zs-off { border-left-color: rgba(120,146,200,.4); }

.zone-card .zc-state-row {
	display: flex;
	align-items: center;
	gap: 5px;
	line-height: 1;
	min-width: 0;
}

.zone-card .zc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(120,146,200,.4);
}

.zone-card .zc-state-label {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: .55px;
	color: var(--text-secondary);
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-link {
	margin-left: auto;
	padding: 1px 6px 2px;
	border-radius: 999px;
	border: 1px solid rgba(255,133,49,.44);
	background: rgba(255,133,49,.12);
	color: var(--accent);
	font-size: 9px;
	font-weight: 800;
	line-height: 1.2;
	letter-spacing: .55px;
	white-space: nowrap;
}
.zone-card .zc-link[hidden] { display: none; }

.zone-card .zc-zone-name {
	font-size: 14px;
	font-weight: 800;
	line-height: 1;
	color: var(--text-strong);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-friendly {
	font-size: 12px;
	font-weight: 600;
	line-height: 1.1;
	color: var(--text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
`;F("zone-card",Ur);var Yr=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span><span class="zc-link" hidden>LINK</span></div>
		<div class="zc-zone-name">${Y(e.zone)}</div>
		<div class="zc-friendly">${we(e.zone)||"---"}</div>
	</div>
`,$s=T({tag:"zone-card",state:e=>({zone:e.zone}),render:Yr,onMount(e,t){let o=e.zone,r=l.temp(o),n=l.state(o),c=l.enabled(o),i=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),s=t.querySelector(".zc-link"),u=t.querySelector(".zc-zone-name"),g=t.querySelector(".zc-friendly");function b(f){let m=String(f||"").match(/\d+/);return m?Number(m[0]):0}function v(){let f=U(c),m=String(N(n)||"").toUpperCase()||"OFF",z=String(N(l.motorLastFault(o))||"").toUpperCase(),p=z&&z!=="NONE"&&z!=="OK",_=f&&(m==="FAULT"||p)?"FAULT":m,k=I("selectedZone")===o,h=we(o);u.textContent=Y(o),g.textContent=h||ue(S(r)),i.textContent=f?_:"OFF";let y=b(N(l.syncTo(o))),C=[];for(let L=1;L<=6;L++)L!==o&&b(N(l.syncTo(L)))===o&&C.push(L);let A=y>0&&y!==o||C.length>0;s.hidden=!A,s.textContent=y>0&&y!==o?"LINK Z"+y:C.length>1?"GROUP +"+C.length:"LINK Z"+C[0];let H=y>0&&y!==o?"Grouped with "+Y(y):C.length>0?"Grouped with "+C.map(Y).join(", "):"";t.title=p?"Fault: "+z:H;let D=f?_:"OFF",E=D==="HEATING"?"#ffd380":D==="IDLE"?"#79d17e":D==="FAULT"?"#ff6361":"#6E7E96",M=D==="HEATING"?"#ff8531":D==="IDLE"?"#79d17e":D==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";i.style.color=E,d.style.background=M,d.style.boxShadow=D==="HEATING"?"0 0 5px rgba(255,133,49,.6)":D==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",k),t.classList.toggle("disabled",!f),t.classList.toggle("zs-heating",f&&D==="HEATING"),t.classList.toggle("zs-fault",f&&D==="FAULT"),t.classList.toggle("zs-idle",f&&D!=="HEATING"&&D!=="FAULT"),t.classList.toggle("zs-off",!f)}t.addEventListener("click",()=>{jt(o)}),w(r,v),w(n,v),w(c,v),w(l.motorLastFault(o),v);for(let f=1;f<=6;f++)w(l.syncTo(f),v);R("selectedZone",v),R("zoneNames",v),v()}});var Kr=`
.zone-detail {
  background: linear-gradient(180deg, rgba(0,63,92,.30), rgba(0,32,46,.24));
  border: 1px solid rgba(120,146,200,.30);
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.zone-detail .zd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-detail .zd-title {
  font-size: .95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-strong);
}

/* Header-right cluster: enable toggle sits next to the state pill. */
.zone-detail .zd-head-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zone-detail .zd-badge {
  border-radius: 999px;
  padding: 3px 9px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .7px;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
  border: 1px solid rgba(125,139,167,.22);
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(255,133,49,.15);
  color: var(--state-warn);
  border-color: rgba(255,133,49,.3);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(121,209,126,.12);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.24);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

/* Body layout \u2014 the header's border-bottom is the only divider (no second
   border-top here, which previously read as a doubled horizontal line). */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-kicker {
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 4px;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.zone-detail .zd-target-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-detail .zd-btns {
  display: flex;
  gap: 6px;
}

.zone-detail .spb {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.15rem;
  transition: .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-detail .spb:hover {
  border-color: rgba(255,133,49,.55);
  color: var(--accent);
  background: rgba(255,133,49,.1);
}

/* Toggle uses the canonical .ui-toggle from the shared ui-kit. */

/* Temperatures on a single row: small uppercase label above a large value. */
.zone-detail .zd-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.zone-detail .zd-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zone-detail .zd-stat-label {
  font-size: .64rem;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}

.zone-detail .zd-motor {
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
  margin-top: 2px;
}
.zone-detail .zd-motor-title {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.zone-detail .zd-motor .zd-stats { margin-top: 2px; }
.zone-detail .zd-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
}
/* The [hidden] attribute must beat the display:flex above, or the row shows
   "Last fault NONE" even when there is no fault. */
.zone-detail .zd-fault[hidden] { display: none; }
.zone-detail .zd-fault-label { color: var(--text-secondary); }
.zone-detail .zd-fault-val { color: var(--state-danger); font-weight: 700; font-family: var(--mono); }
`;F("zone-detail",Kr);var Jr=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${Y(e.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker">Target Temperature</div>
        <div class="zd-target-row">
          <button class="spb btn-dec">\u2212</button>
          <div class="zd-setpoint">---</div>
          <button class="spb btn-inc">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <div class="zd-motor">
        <div class="zd-motor-title">Motor learned parameters</div>
        <div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div>
        <div class="zd-fault" hidden><span class="zd-fault-label">Last fault</span><span class="zd-fault-val">NONE</span></div>
      </div>
    </div>
  </div>
`;function Ho(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Ro(e){return e!=null?Number(e).toFixed(0):"---"}function Qr(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var Ks=T({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Jr,methods:{update(e,t){let o=I("selectedZone"),r=String(N(l.state(o))||"").toUpperCase(),n=U(l.enabled(o));this.zone=o,e.dataset.zone=String(o),t.title.textContent=Y(o),t.setpoint.textContent=ue(S(l.setpoint(o))),t.temp.textContent=ue(S(l.temp(o))),t.ret.textContent=ue(S("sensor-manifold_return_temperature")),t.valve.textContent=at(S(l.valve(o)));let c=t.badge;c.textContent=n?r||"IDLE":"DISABLED";let i=n?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";c.className="zd-badge"+(i?" "+i:""),t.toggle.classList.toggle("on",n),t.orip.textContent=Ro(S(l.motorOpenRipples(o))),t.crip.textContent=Ro(S(l.motorCloseRipples(o))),t.ofac.textContent=Ho(S(l.motorOpenFactor(o))),t.cfac.textContent=Ho(S(l.motorCloseFactor(o))),t.ph.textContent=Qr(S(l.preheatAdvance(o)));let d=String(N(l.motorLastFault(o))||"").toUpperCase(),s=d&&d!=="NONE"&&d!=="OK";t.fault.hidden=!s,s&&(t.faultVal.textContent=d)},incSetpoint(){let e=this.zone,t=S(l.setpoint(e))||20;zt(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=S(l.setpoint(e))||20;zt(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=U(l.enabled(e));oo(e,!t)}},onMount(e,t){let o={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};o.inc.onclick=()=>e.incSetpoint(),o.dec.onclick=()=>e.decSetpoint(),o.toggle.onclick=()=>e.toggleEnabled();let r=()=>e.update(t,o),n=c=>{let i=I("selectedZone");(c===l.temp(i)||c===l.setpoint(i)||c===l.valve(i)||c===l.state(i)||c===l.enabled(i))&&r()};for(let c=1;c<=6;c++)w(l.temp(c),n),w(l.setpoint(c),n),w(l.valve(c),n),w(l.state(c),n),w(l.enabled(c),n),w(l.motorOpenRipples(c),r),w(l.motorCloseRipples(c),r),w(l.motorOpenFactor(c),r),w(l.motorCloseFactor(c),r),w(l.preheatAdvance(c),r),w(l.motorLastFault(c),r);w("sensor-manifold_return_temperature",r),R("selectedZone",r),r()}});var ea=`
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.zone-sensor-card .ble-row .ble-input:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-scan:disabled {
  opacity: .5;
  cursor: default;
}
.zone-sensor-card .ble-scan-list {
  margin-top: 6px;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  overflow: hidden;
}
.zone-sensor-card .ble-scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: .82rem;
  gap: 8px;
  border-bottom: 1px solid var(--panel-border);
}
.zone-sensor-card .ble-scan-item:last-child { border-bottom: none; }
.zone-sensor-card .ble-scan-item .ble-mac {
  font-family: monospace;
  color: var(--text);
  font-size: .8rem;
}
.zone-sensor-card .ble-scan-item .ble-meta {
  color: var(--text-secondary);
  font-size: .75rem;
}
.zone-sensor-card .ble-scan-item .ble-badge {
  color: var(--text-faint);
  font-size: .72rem;
  font-style: italic;
}
.zone-sensor-card .btn-assign {
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-assign:hover {
  background: rgba(124,155,208,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
.zone-sensor-card .merge-visual {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(255,133,49,.24);
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255,133,49,.10), rgba(138,80,143,.12));
}
.zone-sensor-card .merge-visual.is-solo {
  border-color: var(--panel-border);
  background: rgba(124,155,208,.07);
}
.zone-sensor-card .merge-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.zone-sensor-card .merge-pill {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 10px;
  color: var(--text-strong);
  font-size: .82rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(0,32,46,.34);
}
.zone-sensor-card .merge-pill.secondary {
  border-color: rgba(138,80,143,.42);
}
.zone-sensor-card .merge-pill.primary {
  border-color: rgba(255,133,49,.52);
  color: var(--accent);
}
.zone-sensor-card .merge-link {
  width: 22px;
  height: 2px;
  flex: 0 0 22px;
  background: var(--accent);
  border-radius: 999px;
  position: relative;
  opacity: .9;
}
.zone-sensor-card .merge-link::before,
.zone-sensor-card .merge-link::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(255,133,49,.5);
}
.zone-sensor-card .merge-link::before { left: -1px; }
.zone-sensor-card .merge-link::after { right: -1px; }
.zone-sensor-card .merge-visual.is-solo .merge-link {
  background: rgba(120,146,200,.36);
}
.zone-sensor-card .merge-visual.is-solo .merge-link::before,
.zone-sensor-card .merge-visual.is-solo .merge-link::after {
  background: rgba(120,146,200,.42);
  box-shadow: none;
}
.zone-sensor-card .merge-caption {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: .74rem;
  line-height: 1.35;
}
`;F("zone-sensor-card",ea);var ta=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title">Temperature Sensors / Connectivity</div>
      <div class="ui-row">
        <span class="ui-label">Zone Return Temperature Sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Temperature Source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section">BLE Sensor</div>
        <div class="ui-note">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</div>
        <div class="ble-row">
          <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="ui-divider"></div>
      <div class="ui-row">
        <span class="ui-label">Merge With Zone <span class="ui-sublabel">merge into one room \u2014 mean temperature, valves open equally</span></span>
        <span class="ui-field"><select class="ui-select zs-sync"></select></span>
      </div>
      <div class="merge-visual is-solo" aria-live="polite">
        <div class="merge-rail"></div>
        <div class="merge-caption"></div>
      </div>
    </div>
  `};function oa(e,t){let o=e.value,r="<option>None</option>";for(let n=1;n<=6;n++)n!==t&&(r+="<option>Zone "+n+"</option>");e.innerHTML=r,e.value=o||"None"}function ra(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function aa(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function na(e,t){let o="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==o&&(e.innerHTML=o),e.value=t}function qo(e){let t=String(e||"").match(/\d+/);return t?Number(t[0]):0}var ni=T({tag:"zone-sensor-card",render:ta,onMount(e,t){let o=t.querySelector(".zs-probe"),r=t.querySelector(".zs-source"),n=t.querySelector(".zs-ble"),c=t.querySelector(".zs-sync"),i=t.querySelector(".zs-row-ble"),d=t.querySelector(".zs-scan"),s=t.querySelector(".zs-scan-list"),u=t.querySelector(".merge-visual"),g=t.querySelector(".merge-rail"),b=t.querySelector(".merge-caption"),v=0;function f(){return I("selectedZone")}function m(){i.style.display=r.value==="BLE Sensor"?"":"none"}function z(){let y=f(),C=qo(c.value),A=[];for(let M=1;M<=6;M++)M!==y&&qo(N(l.syncTo(M)))===y&&A.push(M);let H=C>0&&C!==y,D=H||A.length>0;if(u.classList.toggle("is-solo",!D),!D){g.innerHTML='<span class="merge-pill primary">'+Y(y)+'</span><span class="merge-link"></span><span class="merge-pill">No room merge</span>',b.textContent="This zone is controlled independently.";return}if(H){g.innerHTML='<span class="merge-pill secondary">'+Y(y)+'</span><span class="merge-link"></span><span class="merge-pill primary">'+Y(C)+"</span>",b.textContent=Y(y)+" follows "+Y(C)+": temperatures are averaged and valves use the primary zone opening.";return}let E='<span class="merge-pill primary">'+Y(y)+"</span>";for(let M of A)E+='<span class="merge-link"></span><span class="merge-pill secondary">'+Y(M)+"</span>";g.innerHTML=E,b.textContent="Group primary: "+Y(y)+" controls "+A.map(Y).join(", ")+". Temperatures are averaged and all grouped valves open equally."}let p=se(t);na(r,"Local Probe"),p.select(o,{read:()=>N(l.probe(f()))||void 0,commit:y=>De(f(),"zone_probe",y)}),p.select(r,{read:()=>ra(String(N(l.tempSource(f()))||"")),commit:y=>De(f(),"zone_temp_source",aa(y))}),p.select(c,{read:()=>N(l.syncTo(f()))||"None",commit:y=>De(f(),"zone_sync_to",y)});let _=p.text(n,{read:()=>N(l.ble(f()))||"",commit:y=>qe(f(),"zone_ble_mac",y)});r.addEventListener("change",m),c.addEventListener("change",z);function k(){let y=f();v!==y?(oa(c,y),v=y,s.style.display="none",p.discard()):p.refresh(),m(),z()}function h(y){let C=f();(y===l.probe(C)||y===l.tempSource(C)||y===l.syncTo(C)||y===l.ble(C)||/^select-zone_\d+_sync_to$/.test(y))&&(p.refresh(),m(),z())}d.addEventListener("click",()=>{if(d.disabled)return;d.disabled=!0,d.textContent="\u2026",s.style.display="",s.innerHTML='<div class="scan-msg">Scanning\u2026</div>';let y=new AbortController,C=setTimeout(()=>y.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:y.signal}).then(A=>{if(!A.ok)throw new Error("HTTP "+A.status);return A.json()}).then(A=>{if(clearTimeout(C),d.disabled=!1,d.textContent="Scan",!A.ok||!A.sensors||A.sensors.length===0){s.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let H=f(),D=(N(l.ble(H))||"").toUpperCase(),E=L=>String(L).replace(/[&<>"']/g,W=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[W]),M="";for(let L of A.sensors){let W=L.mac.toUpperCase(),G=L.name?E(L.name):"",te=L.temp_c!=null?L.temp_c.toFixed(1)+"\xB0C":"\u2014",X=L.rssi!=null?L.rssi+" dBm":"",J=L.age_s<60?L.age_s+"s ago":Math.round(L.age_s/60)+"m ago",Q="";W===D?Q='<span class="ble-badge">assigned to this zone</span>':L.zone>0&&(Q='<span class="ble-badge">zone '+L.zone+"</span>");let K=G?`<div class="ble-mac">${G}</div><div class="ble-meta">${W}</div>`:`<div class="ble-mac">${W}</div>`;M+=`<div class="ble-scan-item">
              <div>
                ${K}
                <div class="ble-meta">${te} &nbsp;${X} &nbsp;${J}</div>
                ${Q}
              </div>
              <button class="btn-assign" data-mac="${W}">Assign</button>
            </div>`}s.innerHTML=M,s.querySelectorAll(".btn-assign").forEach(L=>{L.addEventListener("click",()=>{n.value=L.dataset.mac,_.markDirty(),s.style.display="none"})})}).catch(A=>{clearTimeout(C),d.disabled=!1,d.textContent="Scan";let H=A&&A.name==="AbortError"?"Scan timed out \u2014 device busy or BLE not responding. Try again.":"Scan failed. Check device connectivity.";s.innerHTML='<div class="scan-msg">'+H+"</div>"})}),R("selectedZone",k);for(let y=1;y<=6;y++)w(l.probe(y),h),w(l.tempSource(y),h),w(l.syncTo(y),h),w(l.ble(y),h);k()}});var sa=[0,.5,.7,.85,1];function ia(e){return sa[Math.min(e,4)]}var la=`
.zone-room-card { height: 100%; }

.zone-room-card .wall-lbl-hint {
  font-size: .72rem;
  color: var(--text-faint);
  font-style: italic;
  margin: 2px 0 8px;
}
.zone-room-card .wall-lbl-hint::after { content: 'Select all that apply'; }

.zone-room-card .wall-btn-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.zone-room-card .wall-btn {
  padding: 8px 4px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: .79rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.zone-room-card .wall-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(124,155,208,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;F("zone-room-card",la);var ca=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title">Zone Settings</div>
    <div class="ui-row">
      <span class="ui-label">Friendly Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Zone Area (m\xB2)</span>
      <span class="ui-field"><input class="ui-input zr-area" type="number" min="1" step="0.1" placeholder="m2"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Pipe Spacing C-C (mm)</span>
      <span class="ui-field"><input class="ui-input zr-spacing" type="number" min="50" step="5" placeholder="200"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Pipe Type</span>
      <span class="ui-field"><select class="ui-select zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select></span>
    </div>

    <div class="ui-section">Exterior Walls</div>
    <div class="wall-lbl-hint"></div>
    <div class="wall-btn-group">
      <button class="wall-btn" data-wall="None">None</button>
      <button class="wall-btn" data-wall="N">N</button>
      <button class="wall-btn" data-wall="S">S</button>
      <button class="wall-btn" data-wall="E">E</button>
      <button class="wall-btn" data-wall="W">W</button>
    </div>

    <div class="ui-divider"></div>
    <div class="ui-section">Forecast Preload</div>
    <div class="ui-row">
      <span class="ui-label">Wind Exposure</span>
      <span class="ui-field"><input class="ui-input zr-wind" type="number" min="0" max="1" step="0.05" placeholder="0.5"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Solar Gain</span>
      <span class="ui-field"><input class="ui-input zr-solar" type="number" min="0" max="1" step="0.05" placeholder="0.3"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Thermal Lead (h)</span>
      <span class="ui-field"><input class="ui-input zr-lead" type="number" min="0" max="48" step="1" placeholder="4"></span>
    </div>
    <div class="ui-note">Wind exposure (0\u20131) is auto-seeded from the exterior walls above \u2014 edit it for a sheltered or extra-exposed site. Solar (0\u20131) is the passive sun gain that reduces preload; Lead h is how far ahead to start charging the slab before a forecast cold/wind peak.</div>
  </div>
`,mi=T({tag:"zone-room-card",render:ca,onMount(e,t){let o=t.querySelector(".zr-friendly"),r=t.querySelector(".zr-area"),n=t.querySelector(".zr-spacing"),c=t.querySelector(".zr-pipe"),i=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn"),d=t.querySelector(".zr-wind"),s=t.querySelector(".zr-solar"),u=t.querySelector(".zr-lead");function g(){return I("selectedZone")}let b=se(t);b.text(o,{read:()=>we(g())||"",commit:_=>no(g(),_)}),b.num(r,{read:()=>S(l.area(g())),commit:_=>Oe(g(),"zone_area_m2",_)}),b.num(n,{read:()=>S(l.spacing(g())),commit:_=>Oe(g(),"zone_pipe_spacing_mm",_||200)}),b.select(c,{read:()=>N(l.pipeType(g()))||"Unknown",commit:_=>De(g(),"zone_pipe_type",_)});let v=b.num(d,{read:()=>S(l.windExposure(g())),commit:_=>Oe(g(),"zone_wind_exposure",_)});b.num(s,{read:()=>S(l.solarGain(g())),commit:_=>Oe(g(),"zone_solar_gain",_)}),b.num(u,{read:()=>S(l.thermalLeadH(g())),commit:_=>Oe(g(),"zone_thermal_lead_h",_)});let f=[];function m(){i.forEach(_=>{let k=_.dataset.wall;_.classList.toggle("active",k==="None"?f.length===0:f.includes(k))})}let z=b.custom({sync:()=>{let _=N(l.exteriorWalls(g()))||"None";f=_==="None"?[]:_.split(",").filter(Boolean),m()},commit:()=>qe(g(),"zone_exterior_walls",f.length?f.join(","):"None")});i.forEach(_=>{_.addEventListener("click",()=>{let k=_.dataset.wall,h=f.slice();if(k==="None")h=[];else{let y=h.indexOf(k);y>=0?h.splice(y,1):h.push(k)}f=["N","S","E","W"].filter(y=>h.includes(y)),m(),z.markDirty(),d.value=String(ia(f.length)),v.markDirty()})});function p(_){let k=g();(_===l.area(k)||_===l.spacing(k)||_===l.pipeType(k)||_===l.exteriorWalls(k)||_===l.windExposure(k)||_===l.solarGain(k)||_===l.thermalLeadH(k))&&b.refresh()}R("selectedZone",b.discard),R("zoneNames",b.refresh);for(let _=1;_<=6;_++)w(l.area(_),p),w(l.spacing(_),p),w(l.pipeType(_),p),w(l.exteriorWalls(_),p),w(l.windExposure(_),p),w(l.solarGain(_),p),w(l.thermalLeadH(_),p);b.refresh()}});var ve=6,da="#6E7E96",Wo="#5C6B85",pa="#8a508f",ua="#BC5090",ma="#FF8531",fa="#FFA600",ga="#8a508f",ba="#FFEAD2",ha="#6E7E96",Bo="#C7B6CE",mt="#5C6B85",Rt="#A38FB0",$o="#9A86A8",Io="#8a508f",xa="#66BB6A",va="#FF6361",j={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,topBarY:0,topBarH:24,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},P={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},ya=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  background: #042a3b;
}

.flow-svg {
  width: 100%;
  height: auto;
  display: block;
}

.flow-svg-mobile { display: none; }

.flow-zone-hit {
  transition: opacity .2s ease;
}

.flow-ribbon {
  transition: d .6s ease, opacity .35s ease;
}

.flow-metric {
  font-family: var(--mono);
  font-weight: 800;
}

@media (max-width: 760px) {
  .flow-svg-desktop { display: none; }
  .flow-svg-mobile { display: block; }
}
`;F("flow-diagram",ya);function wa(e,t){let o=String(we(e)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>t?r.slice(0,Math.max(1,t-1))+"\u2026":r}function _a(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let o=Number(t[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function za(e,t){return t?e==null||Number.isNaN(e)?Wo:e<.15?pa:e<.4?ua:e<.7?ma:fa:da}function Zo(e){let t=e==="desktop"?"0 1":"1 0",o=[];o.push("<defs>"),o.push('<pattern id="'+e+'-fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="'+e+'-fglow" cx="32%" cy="18%" r="78%"><stop offset="0%" stop-color="rgba(122,167,206,0.18)"/><stop offset="52%" stop-color="rgba(240,121,91,0.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="'+e+'-boxgrad" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(let r=1;r<=ve;r++)o.push('<linearGradient id="'+e+"-rg"+r+'" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'">'),o.push('<stop id="'+e+"-rgs"+r+'" offset="0%" stop-color="#ff8531"/>'),o.push('<stop id="'+e+"-rga"+r+'" offset="100%" stop-color="#8a508f"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function ft(e,t,o){let r=j.boxX+j.boxW/2+(e-2.5)*j.srcSpread,n=j.srcY,c=j.zoneXs[e],i=j.zoneY-20,d=j.fanY,s=j.fanY+34;return"M"+(r-t).toFixed(1)+" "+n+" C"+(r-t).toFixed(1)+" "+d+" "+(c-o).toFixed(1)+" "+s+" "+(c-o).toFixed(1)+" "+i+" L"+(c+o).toFixed(1)+" "+i+" C"+(c+o).toFixed(1)+" "+s+" "+(r+t).toFixed(1)+" "+d+" "+(r+t).toFixed(1)+" "+n+"Z"}function gt(e,t,o){let r=P.midY+(e-2.5)*P.spread,n=P.zoneYs[e],c=P.endX-P.srcX,i=P.srcX+c*.34,d=P.srcX+c*.7;return"M"+P.srcX+" "+(r-t).toFixed(1)+" C"+i+" "+(r-t).toFixed(1)+" "+d+" "+(n-o).toFixed(1)+" "+P.endX+" "+(n-o).toFixed(1)+" L"+P.endX+" "+(n+o).toFixed(1)+" C"+d+" "+(n+o).toFixed(1)+" "+i+" "+(r+t).toFixed(1)+" "+P.srcX+" "+(r+t).toFixed(1)+"Z"}function jo(e,t,o){return'<rect width="'+e+'" height="'+t+'" rx="22" fill="#042a3b"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fdots)" opacity="0.48"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fglow)"/>'}function Vo(e){let t=e==="desktop"?j:P,o=e==="desktop"?t.boxY+27:t.boxY+29,r=e==="desktop"?t.boxY+56:t.boxY+58;return'<rect x="'+t.boxX+'" y="'+t.boxY+'" width="'+t.boxW+'" height="'+t.boxH+'" rx="7" fill="#ff8531"/><text x="'+(t.boxX+t.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(e==="desktop"?18:17)+'" font-weight="800" fill="#00202e" letter-spacing="2">FLOW</text><text id="'+e+'-fd-flow-temp" class="flow-metric" x="'+(t.boxX+t.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(e==="desktop"?26:24)+'" fill="#00202e">---</text>'}function Sa(){let e=[],t=j.w,o=j.h,r=j.zoneY-20;e.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+t+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet">'),e.push(Zo("desktop")),e.push(jo(t,o,"desktop")),e.push('<rect x="'+j.boxX+'" y="'+j.topBarY+'" width="'+j.boxW+'" height="'+j.topBarH+'" fill="url(#desktop-boxgrad)" rx="5"/>'),e.push(Vo("desktop")),e.push('<text id="desktop-fd-ret-temp" x="'+(j.boxX+j.boxW+24)+'" y="'+(j.boxY+20)+'" font-size="15" font-weight="800" fill="#8a508f" font-family="var(--mono)">RET ---</text>'),e.push('<text x="'+(j.boxX+j.boxW+24)+'" y="'+(j.boxY+42)+'" font-size="12" font-weight="800" fill="'+$o+'" letter-spacing="2">\u0394T FLOW-RETURN</text>'),e.push('<text id="desktop-fd-dt" x="'+(j.boxX+j.boxW+24)+'" y="'+(j.boxY+65)+'" class="flow-metric" font-size="22" fill="#ff8531">---</text>');for(let n=1;n<=ve;n++)e.push('<path d="'+ft(n-1,j.srcHW,j.bgDstHW)+'" fill="#062a3a" opacity="0.86"/>');for(let n=1;n<=ve;n++)e.push('<path id="desktop-fd-path-'+n+'" class="flow-ribbon" d="'+ft(n-1,j.srcHW,j.bgDstHW)+'" fill="url(#desktop-rg'+n+')" opacity="1"/>');e.push('<line x1="54" y1="'+r+'" x2="'+(t-54)+'" y2="'+r+'" stroke="#ff8531" stroke-width="2" opacity=".42"/>');for(let n=1;n<=ve;n++){let c=j.zoneXs[n-1];e.push('<g class="flow-zone-hit">'),e.push('<line x1="'+c+'" y1="'+(r-8)+'" x2="'+c+'" y2="'+(r+8)+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="desktop-fd-zn'+n+'" x="'+c+'" y="'+(r-13)+'" text-anchor="middle" font-size="13" fill="#FFEAD2" font-weight="800" letter-spacing="1.8">Z'+n+"</text>"),e.push('<text id="desktop-fd-zf'+n+'" x="'+c+'" y="'+(r+20)+'" text-anchor="middle" font-size="9.5" fill="#B6A6C0" font-weight="700" letter-spacing=".8">---</text>'),e.push('<text id="desktop-fd-zsp'+n+'" x="'+c+'" y="'+(r+20)+'" text-anchor="middle" font-size="9" fill="'+mt+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="desktop-fd-zt'+n+'" x="'+c+'" y="'+(r+42)+'" text-anchor="middle" class="flow-metric" font-size="15" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="desktop-fd-zv'+n+'" x="'+(c-28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C7B7D0">---%</text>'),e.push('<text id="desktop-fd-zr'+n+'" x="'+(c+28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C7B7D0">---</text>'),e.push("</g>")}return e.push("</svg>"),e.join("")}function ka(){let e=[],t=P.w,o=P.h;e.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+t+" "+o+'" preserveAspectRatio="xMidYMid meet">'),e.push(Zo("mobile")),e.push(jo(t,o,"mobile")),e.push('<rect x="0" y="'+P.boxY+'" width="'+(P.boxX-6)+'" height="'+P.boxH+'" fill="url(#mobile-boxgrad)" rx="4"/>'),e.push(Vo("mobile"));for(let r=1;r<=ve;r++)e.push('<path d="'+gt(r-1,P.srcHW,P.bgDstHW)+'" fill="#062a3a" opacity="0.86"/>');for(let r=1;r<=ve;r++)e.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+gt(r-1,P.srcHW,P.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');e.push('<rect x="'+(P.boxX+9)+'" y="'+(P.boxY+P.boxH+9)+'" width="'+(P.boxW-18)+'" height="60" rx="8" fill="rgba(4,42,59,.64)"/>'),e.push('<text id="mobile-fd-ret-temp" x="'+(P.boxX+P.boxW/2)+'" y="'+(P.boxY+P.boxH+27)+'" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8a508f" font-family="var(--mono)">RET ---</text>'),e.push('<text x="'+(P.boxX+P.boxW/2)+'" y="'+(P.boxY+P.boxH+43)+'" text-anchor="middle" font-size="9.5" font-weight="800" fill="'+$o+'" letter-spacing="1.1">\u0394T FLOW-RETURN</text>'),e.push('<text id="mobile-fd-dt" x="'+(P.boxX+P.boxW/2)+'" y="'+(P.boxY+P.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="#ff8531">---</text>'),e.push('<line x1="'+P.endX+'" y1="34" x2="'+P.endX+'" y2="'+(o-34)+'" stroke="#ff8531" stroke-width="2" opacity=".48"/>'),e.push('<text x="506" y="30" font-size="10" fill="'+Rt+'" font-weight="700" letter-spacing="1.5">TEMP</text>'),e.push('<text x="592" y="30" font-size="10" fill="'+Rt+'" font-weight="700" letter-spacing="1.5">FLOW</text>'),e.push('<text x="678" y="30" font-size="10" fill="'+Rt+'" font-weight="700" letter-spacing="1.5">RET</text>');for(let r=1;r<=ve;r++){let n=P.zoneYs[r-1];e.push('<line x1="'+(P.endX-8)+'" y1="'+n+'" x2="'+(P.endX+8)+'" y2="'+n+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="mobile-fd-zn'+r+'" x="'+(P.endX-14)+'" y="'+(n+4)+'" text-anchor="end" font-size="12" fill="#FFEAD2" font-weight="800" letter-spacing="1.4">Z'+r+"</text>"),e.push('<text id="mobile-fd-zf'+r+'" x="'+P.nameX+'" y="'+(n-8)+'" text-anchor="middle" font-size="9" fill="#B6A6C0" font-weight="700" letter-spacing=".7">---</text>'),e.push('<text id="mobile-fd-zsp'+r+'" x="'+P.nameX+'" y="'+(n+7)+'" text-anchor="middle" font-size="8.5" fill="'+mt+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(n+4)+'" class="flow-metric" font-size="13.5" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(n+4)+'" class="flow-metric" font-size="13.5" fill="#C7B7D0">---%</text>'),e.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(n+4)+'" class="flow-metric" font-size="13.5" fill="#C7B7D0">---</text>')}return e.push("</svg>"),e.join("")}var Ea=()=>'<div class="flow-wrap">'+Sa()+ka()+"</div>";T({tag:"flow-diagram",render:Ea,onMount(e,t){let o=["desktop","mobile"],r={};o.forEach(s=>{r[s]={flowEl:t.querySelector("#"+s+"-fd-flow-temp"),retEl:t.querySelector("#"+s+"-fd-ret-temp"),dtEl:t.querySelector("#"+s+"-fd-dt"),zones:new Array(ve+1)};for(let u=1;u<=ve;u++)r[s].zones[u]={textTemp:t.querySelector("#"+s+"-fd-zt"+u),textSetpoint:t.querySelector("#"+s+"-fd-zsp"+u),textFlow:t.querySelector("#"+s+"-fd-zv"+u),textRet:t.querySelector("#"+s+"-fd-zr"+u),label:t.querySelector("#"+s+"-fd-zn"+u),friendly:t.querySelector("#"+s+"-fd-zf"+u),path:t.querySelector("#"+s+"-fd-path-"+u)}});function n(s,u){s&&(s.textContent=u)}function c(s,u,g,b,v){let f=r[s];n(f.flowEl,ue(u)),n(f.retEl,"RET "+ue(g)),n(f.dtEl,b==null?"---":b.toFixed(1)+"\xB0C"),f.dtEl&&f.dtEl.setAttribute("fill",v)}function i(s,u,g){let b=r[s].zones[u];if(!b)return;let{enabled:v,pct:f,temp:m,setpoint:z,valve:p,returnTemp:_,hasReturn:k}=g,h=wa(u,s==="desktop"?11:12),y=ue(m),C=z!=null?ue(z):"";n(b.label,"Z"+u),n(b.friendly,s==="desktop"?(h||"---")+(C?" ("+C+")":""):h||"---"),n(b.textTemp,y),n(b.textSetpoint,s==="desktop"?"":C?"("+C+")":""),n(b.textFlow,at(p)),n(b.textRet,k?ue(_):"---"),b.label.setAttribute("fill",v?ba:ha),b.friendly.setAttribute("fill",v?Bo:mt),b.textSetpoint.setAttribute("fill",v?Bo:mt),b.textFlow.setAttribute("fill",za(f,v)),b.textRet.setAttribute("fill",k&&v?ga:Wo);let A=b.path;if(!v)A.setAttribute("d",s==="desktop"?ft(u-1,1,2):gt(u-1,1,2)),A.setAttribute("fill","#062a3a"),A.setAttribute("opacity","0.38");else{let H=s==="desktop"?j:P,D=Math.max(2.5,f*H.bgDstHW),E=Math.max(1.3,f*H.srcHW);A.setAttribute("d",s==="desktop"?ft(u-1,E,D):gt(u-1,E,D)),A.setAttribute("fill","url(#"+s+"-rg"+u+")"),A.setAttribute("opacity","1")}}function d(){let s=S(a.flow),u=S(a.ret),g=s!=null&&u!=null?Number(s)-Number(u):null,b=g==null||g<3?Io:g>8?va:xa;o.forEach(v=>c(v,s,u,g,b));for(let v=1;v<=ve;v++){let f=S(l.temp(v)),m=S(l.setpoint(v)),z=S(l.valve(v)),p=U(l.enabled(v)),_=String(N(l.tempSource(v))||"Local Probe"),k=_a(N(l.probe(v))||""),h=k?S(l.probeTemp(k)):null,y=_!=="Local Probe"&&h!=null&&!Number.isNaN(Number(h)),C=z!=null?Math.max(0,Math.min(100,Number(z)))/100:0,A={enabled:p,pct:C,temp:f,setpoint:m,valve:z,returnTemp:h,hasReturn:y};o.forEach(H=>i(H,v,A))}}w(a.flow,d),w(a.ret,d),R("zoneNames",d);for(let s=1;s<=ve;s++)w(l.temp(s),d),w(l.setpoint(s),d),w(l.valve(s),d),w(l.enabled(s),d),w(l.probe(s),d),w(l.tempSource(s),d);for(let s=1;s<=8;s++)w(l.probeTemp(s),d);d()}});var Ca=48,La=1e3,qt="var(--series-warm)",bt="var(--series-cool)",Bt="var(--series-solar)",Ma=2,xt=1e3,Go=220,Ce=46,Fa=52,pe=14,Aa=44,ht=xt-Ce-Fa,ye=Go-pe-Aa,Ee=pe+ye,Na=`
.forecast-preview .fc-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.forecast-preview .fc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease, opacity .14s ease;
}
.forecast-preview .fc-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.forecast-preview .fc-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.forecast-preview .fc-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.forecast-preview .fc-toggle[data-layer="temp"] { color: var(--series-warm); }
.forecast-preview .fc-toggle[data-layer="wind"] { color: var(--series-cool); }
.forecast-preview .fc-toggle[data-layer="solar"] { color: var(--series-solar); }
.forecast-preview .fc-wind-guide {
  opacity: .34;
}
.forecast-preview .fc-wind-arrow {
  fill: var(--series-cool);
  stroke: rgba(4,18,28,.35);
  stroke-width: .28;
  stroke-linejoin: round;
  opacity: .76;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 2px rgba(188,80,144,.22));
}
.forecast-preview .fc-wind-arrow.now {
  fill: var(--series-solar);
}
`;F("monitor-forecast-preview",Na);var Ta=()=>`
  <div class="chart-card forecast-preview">
    <div class="chart-head">
      <span class="chart-title">Weather Forecast</span>
      <span class="chart-sub"></span>
    </div>
    <div class="fc-controls" role="toolbar" aria-label="Forecast chart layers">
      <button type="button" class="fc-toggle" data-layer="temp" aria-pressed="true">Temp</button>
      <button type="button" class="fc-toggle" data-layer="wind" aria-pressed="true">Wind + dir</button>
      <button type="button" class="fc-toggle" data-layer="solar" aria-pressed="true">Solar</button>
    </div>
    <div class="fc-body"></div>
  </div>
`;function Da(e){if(!e)return"No data";if(e<16e8)return"Clock syncing\u2026";let t=new Date(e*1e3),o=t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),r=new Date;return"Updated "+(t.getFullYear()===r.getFullYear()&&t.getMonth()===r.getMonth()&&t.getDate()===r.getDate()?o:t.toLocaleDateString([],{month:"short",day:"numeric"})+" "+o)}function Oa(e){return Number.isFinite(Number(e))?["N","NE","E","SE","S","SW","W","NW"][Math.round((Number(e)%360+360)%360/45)%8]:"---"}function Pa(e){if(!Number.isFinite(Number(e)))return"---";let t=Math.round((Number(e)%360+360)%360);return Oa(t)+" "+t+"\xB0"}function Ha(e,t){let o=e.hours.slice(0,Ca),r=o.length,n=o.map(h=>h[0]),c=o.map(h=>h[1]),i=o.map(h=>h[2]),d=o.map(h=>h[3]||0),s=_o(n,0,10),u=Math.max(2,...c)*1.15,g=h=>Ce+(r<=1?0:h/(r-1)*ht),b=h=>pe+(1-(h-s.min)/(s.max-s.min))*ye,v=h=>pe+(1-h/u)*ye,f=h=>pe+(1-Math.max(0,Math.min(1,h/La)))*ye,m=$("svg",{viewBox:`0 0 ${xt} ${Go}`,preserveAspectRatio:"xMidYMid meet"});for(let h=0;h<4;h++){let y=h/3,C=pe+y*ye;m.appendChild($("line",{x1:Ce,y1:C,x2:Ce+ht,y2:C,class:"chart-grid"})),t.temp&&m.appendChild($("text",{x:Ce-7,y:C+4,"text-anchor":"end",class:"chart-tick"},(s.max-(s.max-s.min)*y).toFixed(0)+"\xB0")),t.wind&&m.appendChild($("text",{x:Ce+ht+7,y:C+4,"text-anchor":"start",class:"chart-tick"},(u-u*y).toFixed(0)))}if(m.appendChild($("line",{x1:Ce,y1:Ee,x2:Ce+ht,y2:Ee,class:"chart-axis"})),t.temp&&m.appendChild($("text",{x:12,y:pe+ye/2,transform:`rotate(-90 12 ${(pe+ye/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"\xB0C")),t.wind&&m.appendChild($("text",{x:xt-12,y:pe+ye/2,transform:`rotate(90 ${xt-12} ${(pe+ye/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"m/s")),t.solar){let h="";for(let y=0;y<r;y++)h+=(y?" L ":"M ")+g(y).toFixed(1)+" "+f(d[y]).toFixed(1);h&&(h+=` L ${g(r-1).toFixed(1)} ${Ee} L ${g(0).toFixed(1)} ${Ee} Z`,m.appendChild($("path",{d:h,fill:"color-mix(in srgb, var(--series-solar) 18%, transparent)",stroke:"none"})))}let z=e.base_epoch?Math.floor((Date.now()/1e3-e.base_epoch)/3600):-1,p=new Date(e.base_epoch*1e3).getDate(),_=-1;for(let h=0;h<r;h++){let y=new Date((e.base_epoch+h*3600)*1e3),C=h===z,A=y.getDate()!==p;A&&_<0&&y.getHours()===0&&(_=h);let H=g(h),D=Ee+13;m.appendChild($("text",{x:H,y:D,"text-anchor":"end",transform:`rotate(-45 ${H.toFixed(1)} ${D})`,class:"chart-hour"+(C?" now":A?" day2":"")},String(y.getHours()).padStart(2,"0"))),C&&(m.appendChild($("line",{x1:H,y1:pe,x2:H,y2:Ee,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"})),m.appendChild($("text",{x:H+4,y:pe+11,"text-anchor":"start",class:"chart-hour now"},"now")))}if(_>0){let h=g(_);m.appendChild($("line",{x1:h,y1:pe,x2:h,y2:Ee,stroke:"rgba(202,219,248,.26)","stroke-width":"1","stroke-dasharray":"4 4","vector-effect":"non-scaling-stroke"})),m.appendChild($("text",{x:h+4,y:pe+11,"text-anchor":"start",class:"chart-hour day2"},"+1d"))}if(t.wind){m.appendChild($("path",{d:Pe(c.map((y,C)=>({x:g(C),y:v(y)}))),class:"fc-wind-guide",fill:"none",stroke:bt,"stroke-width":"1.5","stroke-linejoin":"round","stroke-linecap":"round"}));let h=$("g",{class:"fc-wind-arrows","aria-label":"Wind direction arrows"});for(let y=0;y<r;y++){if(y%Ma!==0&&y!==z)continue;let C=Number(i[y]);if(!Number.isFinite(C))continue;let A=g(y),H=v(c[y]);h.appendChild($("path",{d:"M -4.8 -1.1 L .7 -1.1 L .7 -3.6 L 5.6 0 L .7 3.6 L .7 1.1 L -4.8 1.1 Z",class:"fc-wind-arrow"+(y===z?" now":""),transform:`translate(${A.toFixed(1)} ${H.toFixed(1)}) rotate(${(C-90).toFixed(1)})`}))}m.appendChild(h)}t.temp&&m.appendChild($("path",{d:Pe(n.map((h,y)=>({x:g(y),y:b(h)}))),fill:"none",stroke:qt,"stroke-width":"2.6","stroke-linejoin":"round","stroke-linecap":"round"})),t.solar&&m.appendChild($("path",{d:Pe(d.map((h,y)=>({x:g(y),y:f(h)}))),fill:"none",stroke:Bt,"stroke-width":"1.8","stroke-linejoin":"round","stroke-linecap":"round",opacity:".85"}));let k=[];return t.temp&&k.push(h=>({y:b(n[h]),color:qt})),t.wind&&k.push(h=>({y:v(c[h]),color:bt})),t.solar&&k.push(h=>({y:f(d[h]),color:Bt})),{svg:m,model:{count:r,plotTop:pe,plotBottom:Ee,xAt:g,label:h=>String(new Date((e.base_epoch+h*3600)*1e3).getHours()).padStart(2,"0")+":00",dots:h=>k.map(y=>y(h)),rows:h=>{let y=[];return t.temp&&y.push({color:qt,label:"Temp",value:n[h].toFixed(1)+"\xB0"}),t.wind&&(y.push({color:bt,label:"Wind",value:c[h].toFixed(1)+" m/s"}),y.push({color:bt,label:"From",value:Pa(i[h])})),t.solar&&y.push({color:Bt,label:"Solar",value:Math.round(d[h])+" W/m\xB2"}),y}}}}var Si=T({tag:"monitor-forecast-preview",render:Ta,onMount(e,t){let o=t.querySelector(".chart-sub"),r=t.querySelector(".fc-body"),n=t.matches(".forecast-preview")?t:t.querySelector(".forecast-preview"),c=Array.from(t.querySelectorAll(".fc-toggle")),i={temp:!0,wind:!0,solar:!0},d=null;function s(){c.forEach(g=>{let b=g.dataset.layer;g.classList.toggle("is-off",!i[b]),g.setAttribute("aria-pressed",i[b]?"true":"false")})}function u(){d&&(d(),d=null);let g=Ke(),b=g&&Array.isArray(g.hours)?g.hours:[];if(!(g?g.count||b.length:0)||!b.length||!g.base_epoch){o.textContent="No data",r.innerHTML='<div style="color:var(--text-secondary);font-size:.8rem;text-align:center;padding:34px">No forecast fetched yet. Enable Forecast Preload in Settings and check the location.</div>';return}o.textContent=Da(g.fetch_epoch),r.innerHTML="";let{svg:f,model:m}=Ha(g,i);r.appendChild(f),d=st(f,n,m)}c.forEach(g=>{g.addEventListener("click",()=>{let b=g.dataset.layer;i[b]=!i[b],s(),u()})}),R("forecastHours",u),s(),u()}});var Ra={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#8a508f"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},qa=`
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.logs-view .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.logs-view .actions { display: flex; gap: 6px; }
.logs-view .btn {
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  cursor: pointer;
}
.logs-view .btn:hover { color: var(--text-strong); background: var(--control-bg-hover); }
.logs-view .btn.on { color: var(--text-on-accent); border-color: var(--accent); background: var(--accent); }

.logs-stream {
  margin-top: 4px;
  height: 420px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(8,18,34,.55);
  border: 1px solid var(--control-border);
  padding: 6px 0;
  font-family: var(--mono);
  scrollbar-width: thin;
  scrollbar-color: rgba(124,155,208,.25) transparent;
}
.logs-stream::-webkit-scrollbar { width: 6px; }
.logs-stream::-webkit-scrollbar-thumb { background: rgba(124,155,208,.25); border-radius: 999px; }

.logs-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 24px; }

.log-line {
  display: grid;
  grid-template-columns: 20px 104px 1fr;
  gap: 8px;
  padding: 3px 12px;
  font-size: .84rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.log-line .lv { font-weight: 800; text-align: center; }
.log-line .tag { color: var(--accent); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-line .msg { color: var(--text-strong); opacity: .92; }
`;F("logs-view",qa);var Ba=()=>`
  <div class="logs-view">
    <div class="card-title">
      <span>Device Logs</span>
      <div class="actions">
        <button class="btn pause-btn" type="button">Pause</button>
        <button class="btn clear-btn" type="button">Clear</button>
      </div>
    </div>
    <div class="logs-stream"></div>
  </div>
`;function Ia(e){let t=Ra[e.level]||{label:"?",color:"var(--text-secondary)"},o=Xo(e.tag||""),r=Xo(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function Xo(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var Mi=T({tag:"logs-view",render:Ba,onMount(e,t){let o=t.querySelector(".logs-stream"),r=t.querySelector(".pause-btn"),n=t.querySelector(".clear-btn"),c=!1;function i(){if(c)return;let d=Yt();if(!d||!d.length){o.innerHTML='<div class="logs-empty">Waiting for device logs\u2026</div>';return}let s=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=d.map(Ia).join(""),s&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{c=!c,r.textContent=c?"Resume":"Pause",r.classList.toggle("on",c),c||i()}),n.addEventListener("click",()=>{Kt()}),R("deviceLog",i),i()}});var Wa=`
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-i2c .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-i2c pre {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.btn-row { margin-top: 12px; }
.btn { padding: 7px 14px; border-radius: 10px; border: 1px solid var(--control-border); background: var(--control-bg); color: var(--text-strong); font-weight: 700; cursor: pointer; }
.btn:hover { background: var(--control-bg-hover); border-color: rgba(255,133,49,.5); color: #ffe7b9; }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;F("diag-i2c",Wa);var $a=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,Oi=T({tag:"diag-i2c",render:$a,onMount(e,t){let o=t.querySelector("#i2c-result");function r(){o.textContent=I("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{ro()}),R("i2cResult",r),r()}});var Za=`
.diag-activity {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.diag-activity .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.diag-log {
  margin-top: 8px;
  max-height: 220px;
  overflow-y: auto;
  border-radius: 10px;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(124,155,208,.25) transparent;
}
.diag-log::-webkit-scrollbar { width: 5px; }
.diag-log::-webkit-scrollbar-thumb { background: rgba(124,155,208,.25); border-radius: 999px; }
.diag-log::-webkit-scrollbar-track { background: transparent; }

.diag-log-empty { color: var(--text-secondary); font-size: .84rem; text-align: center; padding: 16px; }
.diag-log-item { display: flex; gap: 8px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: .84rem; line-height: 1.5; }
.diag-log-item:last-child { border-bottom: none; }
.diag-log-time { font-family: var(--mono); color: var(--accent); font-size: .76rem; white-space: nowrap; flex-shrink: 0; }
.diag-log-msg { color: var(--text-strong); opacity: .9; }
`;F("diag-activity",Za);var ja=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function Va(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let o="";for(let r=t.length-1;r>=0;r--)o+='<div class="diag-log-item"><span class="diag-log-time">'+t[r].time+'</span><span class="diag-log-msg">'+t[r].msg+"</span></div>";e.innerHTML=o}var Bi=T({tag:"diag-activity",render:ja,onMount(e,t){let o=t.querySelector(".diag-log");function r(){Va(o,Xt())}R("activityLog",r),r()}});var Ga=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,118,118,.45);
  background: linear-gradient(180deg, rgba(83,32,32,.42), rgba(52,21,21,.36));
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}

.diag-manual-badge.on {
  display: flex;
}

.diag-manual-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--state-danger);
  box-shadow: 0 0 10px rgba(255,118,118,.6);
}

.diag-manual-text {
  color: #FFD9D9;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .35px;
  text-transform: uppercase;
}
`;F("diag-manual-badge",Ga);var Xa=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,ji=T({tag:"diag-manual-badge",render:Xa,onMount(e,t){let o=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function r(){let n=!!I("manualMode");o&&o.classList.toggle("on",n)}R("manualMode",r),r()}});var Ua=`
.diag-zone-motor {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone-motor .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-motor .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-motor .cfg-row.manual-row {
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 12px;
  border-bottom: 1px solid var(--panel-border);
  margin-bottom: 14px;
}
.diag-zone-motor .manual-note {
  color: var(--text-secondary);
  font-size: .82rem;
  font-weight: 600;
}
.diag-zone-motor .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-motor .mn-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.diag-zone-motor .sel {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  min-width: 140px;
  transition: border-color .15s ease;
}
.diag-zone-motor .sel:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}
.diag-zone-motor .mn-inp {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  width: 80px;
  font-size: .95rem;
  transition: border-color .15s ease;
}
.diag-zone-motor .mn-inp:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}
.diag-zone-motor .mn-unit {
  color: var(--muted);
  font-size: .9rem;
  font-weight: 500;
}
.diag-zone-motor .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.diag-zone-motor .btn {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-motor .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(255,133,49,.5);
  color: #ffe8ba;
}
.diag-zone-motor .btn.warn {
  background: rgba(255,118,118,.2);
  border-color: rgba(255,118,118,.4);
  color: #FFD9D9;
}
.diag-zone-motor .btn.warn:hover {
  background: linear-gradient(135deg, rgba(255,100,100,.3), rgba(255,100,100,.15));
  border-color: rgba(255,100,100,.5);
}
.diag-zone-motor .sw {
  width: 50px;
  height: 28px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  border: 1px solid var(--control-border);
  position: relative;
  cursor: pointer;
  transition: .2s ease;
  flex-shrink: 0;
}
.diag-zone-motor .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #efe6dd;
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: rgba(124,155,208,.4);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: #042a3b;
}
.diag-zone-motor .gated {
  transition: opacity .18s ease;
}
.diag-zone-motor .gated.locked {
  opacity: .48;
}
.diag-zone-motor .gated.locked .btn,
.diag-zone-motor .gated.locked .mn-inp,
.diag-zone-motor .gated.locked .sel {
  cursor: not-allowed;
}
`;F("diag-zone-motor",Ua);var Ya=e=>{let t=e.zone||I("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">Zone "+r+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl">Motor</span>
          <select class="sel motor-zone-select">${o}</select>
        </div>
        <div class="cfg-row">
          <span class="lbl">Motor Target</span>
          <div class="mn-wrap">
            <input type="number" class="mn-inp motor-target-input" min="0" max="100" step="1" value="0">
            <span class="mn-unit">%</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn motor-open-btn">Open 10s</button>
          <button class="btn motor-close-btn">Close 10s</button>
          <button class="btn warn motor-stop-btn">Stop</button>
        </div>
      </div>
    </div>
  `},Ji=T({tag:"diag-zone-motor-card",render:Ya,onMount(e,t){let o=Number(e.zone||I("selectedZone")||1),r=!!I("manualMode"),n=t.querySelector(".manual-mode-toggle"),c=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),s=t.querySelector(".motor-open-btn"),u=t.querySelector(".motor-close-btn"),g=t.querySelector(".motor-stop-btn");function b(m){r=!!m,n&&(n.classList.toggle("on",r),n.setAttribute("aria-checked",r?"true":"false")),c&&c.classList.toggle("locked",!r),[i,d,s,u,g].forEach(z=>{z&&(z.disabled=!r)})}function v(){let m=!r;if(b(m),m){kt(!0);for(let z=1;z<=6;z++)St(z)}else kt(!1)}function f(){let m=S(l.motorTarget(o));d&&m!=null?d.value=Number(m).toFixed(0):d&&(d.value="0")}i==null||i.addEventListener("change",()=>{o=Number(i.value||1),f()}),n==null||n.addEventListener("click",v),n==null||n.addEventListener("keydown",m=>{m.key!==" "&&m.key!=="Enter"||(m.preventDefault(),v())});for(let m=1;m<=6;m++)w(l.motorTarget(m),f);f(),b(r),R("manualMode",()=>{b(!!I("manualMode"))}),d==null||d.addEventListener("change",m=>{if(!r)return;let z=m.target.value;so(o,z)}),s==null||s.addEventListener("click",()=>{r&&io(o,1e4)}),u==null||u.addEventListener("click",()=>{r&&lo(o,1e4)}),g==null||g.addEventListener("click",()=>{r&&St(o)})}});var Ka=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone-recovery .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-recovery .recovery-note {
  color: var(--text-secondary);
  font-size: .76rem;
  line-height: 1.4;
  margin-bottom: 12px;
}
.diag-zone-recovery .recovery-status {
  margin-top: 10px;
  font-size: .78rem;
  font-weight: 600;
  min-height: 1.1em;
  opacity: 0;
  transition: opacity .15s ease;
}
.diag-zone-recovery .recovery-status.show { opacity: 1; }
.diag-zone-recovery .recovery-status.ok { color: var(--state-ok); }
.diag-zone-recovery .recovery-status.err { color: var(--state-danger); }
.diag-zone-recovery .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.diag-zone-recovery .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-recovery .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-recovery .sel {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  min-width: 140px;
  transition: border-color .15s ease;
}
.diag-zone-recovery .sel:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}
.diag-zone-recovery .btn {
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-recovery .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(255,133,49,.5);
  color: #ffe8ba;
}
.diag-zone-recovery .btn.warn {
  background: rgba(255,118,118,.2);
  border-color: rgba(255,118,118,.4);
  color: #FFD9D9;
}
.diag-zone-recovery .btn.warn:hover {
  background: linear-gradient(135deg, rgba(255,100,100,.3), rgba(255,100,100,.15));
  border-color: rgba(255,100,100,.5);
}
`;F("diag-zone-recovery",Ka);var Ja=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title">Faults &amp; Relearn</div>
      <div class="recovery-note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,al=T({tag:"diag-zone-recovery-card",render:Ja,onMount(e,t){let o=Number(I("selectedZone")||1),r=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),c=t.querySelector(".recovery-relearn-btn"),i=t.querySelector(".recovery-status");R("selectedZone",()=>{o=Number(I("selectedZone")||1)});let d=null;function s(g,b){i.textContent=g,i.className="recovery-status show "+(b?"ok":"err"),clearTimeout(d),d=setTimeout(()=>{i.classList.remove("show")},4e3)}function u(g,b){let v=g(o);s(b,!0),v&&typeof v.then=="function"&&v.then(f=>{f&&f.ok===!1&&s("Failed \u2014 device rejected the request",!1)}).catch(()=>s("Failed \u2014 could not reach device",!1))}r==null||r.addEventListener("click",()=>{u(co,"\u2713 Fault reset sent for "+Y(o))}),n==null||n.addEventListener("click",()=>{confirm("Reset learned factors for "+Y(o)+"?")&&u(po,"\u2713 Learned factors reset for "+Y(o))}),c==null||c.addEventListener("click",()=>{confirm("Reset + relearn motor for "+Y(o)+"?")&&u(uo,"\u2713 Relearn started for "+Y(o))})}});var Qa=`
.diag-system-card .sys-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 4px;
}
.diag-system-card .sys-cell { display: flex; flex-direction: column; gap: 4px; }
.diag-system-card .sys-label {
  color: var(--text-secondary); font-size: .64rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
}
.diag-system-card .sys-value {
  font-family: var(--mono); font-size: 1.5rem; font-weight: 800;
  color: var(--text-strong); line-height: 1;
}
.diag-system-card .sys-value.warn { color: #FFB4B4; }
.diag-system-card .sys-bar {
  height: 4px; border-radius: 3px; margin-top: 6px;
  background: var(--control-bg-hover); overflow: hidden;
}
.diag-system-card .sys-bar > i {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, #6FCF97, #F2C94C, #EB5757);
  background-size: 300% 100%; background-position: 0% 0;
  transition: width .4s ease;
}
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;F("diag-system-card",Qa);var en=()=>`
  <div class="ui-card diag-system-card">
    <div class="ui-card-title"><span>System</span></div>
    <div class="sys-grid">
      <div class="sys-cell">
        <div class="sys-label">CPU Core 0</div>
        <div class="sys-value" data-k="cpu0">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu0"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">CPU Core 1</div>
        <div class="sys-value" data-k="cpu1">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu1"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">Free Heap (int)</div>
        <div class="sys-value" data-k="heap">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">Free PSRAM</div>
        <div class="sys-value" data-k="psram">\u2014</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button">Dump task stats to log</button>
    <div class="ui-note">Per-core load is sampled every 2&nbsp;s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above \u2014 use it to find what saturates a core.</div>
  </div>
`,pl=T({tag:"diag-system-card",render:en,onMount(e,t){let o=t.querySelector('[data-k="cpu0"]'),r=t.querySelector('[data-k="cpu1"]'),n=t.querySelector('[data-k="heap"]'),c=t.querySelector('[data-k="psram"]'),i=t.querySelector('[data-bar="cpu0"]'),d=t.querySelector('[data-bar="cpu1"]'),s=(b,v,f)=>{if(f==null||!Number.isFinite(Number(f))){b.textContent="\u2014",b.classList.remove("warn"),v.style.width="0%";return}let m=Math.max(0,Math.min(100,Number(f)));b.textContent=m.toFixed(0)+"%",b.classList.toggle("warn",m>=90),v.style.width=m+"%",v.style.backgroundPosition=m+"% 0"},u=(b,v,f)=>{if(v==null||!Number.isFinite(Number(v))){b.textContent="\u2014";return}let m=Number(v);b.textContent=m+" KB",b.classList.toggle("warn",f!=null&&m<f)},g=()=>{s(o,i,S(a.cpuLoadCore0)),s(r,d,S(a.cpuLoadCore1)),u(n,S(a.freeInternalKb),48),u(c,S(a.freePsramKb),null)};t.querySelector(".sys-dump").addEventListener("click",()=>{fo().catch(b=>console.error("[System] dump failed:",b))}),w(a.cpuLoadCore0,g),w(a.cpuLoadCore1,g),w(a.freeInternalKb,g),w(a.freePsramKb,g),g()}});var tn=.8,on=`
.preheat-factors-card .pf-list {
  display: grid;
  gap: 9px;
  margin-top: 4px;
}
.preheat-factors-card .pf-row {
  display: grid;
  grid-template-columns: minmax(92px, 1fr) minmax(70px, 1.4fr) 48px;
  gap: 10px;
  align-items: center;
}
.preheat-factors-card .pf-zone {
  min-width: 0;
  color: var(--text-strong);
  font-size: .8rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preheat-factors-card .pf-track {
  height: 7px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(124,155,208,.14);
  border: 1px solid rgba(120,146,200,.18);
}
.preheat-factors-card .pf-fill {
  display: block;
  width: 0%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--series-cool), var(--accent), var(--series-solar));
  transition: width .25s ease;
}
.preheat-factors-card .pf-value {
  color: var(--accent);
  font-family: var(--mono);
  font-size: .82rem;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}
`;F("preheat-factors-card",on);var rn=()=>{let e="";for(let t=1;t<=6;t++)e+=`
      <div class="pf-row" data-zone="${t}">
        <div class="pf-zone"></div>
        <div class="pf-track"><i class="pf-fill"></i></div>
        <div class="pf-value">---</div>
      </div>
    `;return`
    <div class="ui-card preheat-factors-card">
      <div class="ui-card-title"><span>Preheat Factors</span></div>
      <div class="pf-list">${e}</div>
      <div class="ui-note">Learned simple-preheat head-start per zone. The control runs automatically; these values show how much earlier each room starts calling for heat.</div>
    </div>
  `};function an(e){return Number.isFinite(e)?e.toFixed(2)+"C":"---"}var hl=T({tag:"preheat-factors-card",render:rn,onMount(e,t){function o(){for(let r=1;r<=6;r++){let n=t.querySelector('[data-zone="'+r+'"]'),c=Number(S(l.preheatAdvance(r))),i=Number.isFinite(c);n.querySelector(".pf-zone").textContent=Y(r),n.querySelector(".pf-value").textContent=an(c),n.querySelector(".pf-fill").style.width=i?Math.max(0,Math.min(100,c/tn*100))+"%":"0%"}}for(let r=1;r<=6;r++)w(l.preheatAdvance(r),o);R("zoneNames",o),o()}});var nn=`
/* Probe readouts mirror the zone-detail stat style: small uppercase label
   above a large mono value, no cell chrome. */
.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-manifold-card .probe-temp {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}
`;F("settings-manifold-card",nn);var sn=()=>{let e="";for(let o=1;o<=8;o++)e+="<option>Probe "+o+"</option>";let t="";for(let o=1;o<=8;o++)t+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text">Manifold Configuration${ge("Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow\u2013return delta.")}</span></div>
      <div class="ui-row">
        <span class="ui-label">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${e}</select></span>
      </div>
      <div class="ui-section">Probe Temperatures</div>
      <div class="probe-grid">${t}</div>

      <div class="ui-section">Minimum Zone Flow</div>
      <div class="ui-row">
        <span class="ui-label">Enabled <span class="ui-sublabel">manual floor for a modulating heat source, independent of the bridge</span></span>
        <span class="ui-field"><div class="ui-toggle sm-minflow-always" role="switch" aria-label="Enable minimum zone flow"></div></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Min valve opening (%) <span class="ui-sublabel">floor held on every enabled zone while active</span></span>
        <span class="ui-field"><input class="ui-input sm-minflow" type="number" min="0" max="50" step="1" placeholder="15" /></span>
      </div>
    </div>
  `},El=T({tag:"settings-manifold-card",render:sn,onMount(e,t){let o=t.querySelector(".sm-type"),r=t.querySelector(".sm-flow"),n=t.querySelector(".sm-ret"),c=t.querySelector(".sm-minflow-always"),i=t.querySelector(".sm-minflow"),d=se(t);d.select(o,{read:()=>N(a.manifoldType)||"NO (Normally Open)",commit:u=>de("manifold_type",u)}),d.select(r,{read:()=>N(a.manifoldFlowProbe)||"Probe 7",commit:u=>de("manifold_flow_probe",u)}),d.select(n,{read:()=>N(a.manifoldReturnProbe)||"Probe 8",commit:u=>de("manifold_return_probe",u)}),d.toggle(c,{read:()=>U(a.minimumFlowAlways),commit:u=>{let g=u?"on":"off";x(a.minimumFlowAlways,{state:g}),de("minimum_flow_always",g).catch(()=>x(a.minimumFlowAlways,{state:u?"off":"on"}))}}),d.num(i,{read:()=>S(a.minZoneFlowPct),commit:u=>{x(a.minZoneFlowPct,{value:u}),ne("min_zone_flow_pct",u)}});function s(){for(let u=1;u<=8;u++){let g=t.querySelector('[data-probe="'+u+'"]');g&&(g.textContent=ue(S(l.probeTemp(u))))}}w(a.manifoldType,d.refresh),w(a.manifoldFlowProbe,d.refresh),w(a.manifoldReturnProbe,d.refresh),w(a.minimumFlowAlways,d.refresh),w(a.minZoneFlowPct,d.refresh);for(let u=1;u<=8;u++)w(l.probeTemp(u),s);d.refresh(),s()}});var ln=`
.settings-control-stack {
  display: grid;
  gap: 14px;
}

.settings-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-card .toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-card .toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-card .toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

/* Shared toggle styling for consistency across settings cards */
.settings-card .ui-toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}

.settings-card .ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #efe6dd;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #042a3b;
}

.settings-card .btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.settings-card .btn {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: .18s ease;
}

.settings-card .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,146,200,.52);
  color: var(--text-strong);
}

.settings-card .btn.warn {
  grid-column: 1 / -1;
  border-color: rgba(255,118,118,.5);
  background: rgba(255,118,118,.2);
  color: #FFD9D9;
}

.settings-card .btn.warn:hover {
  background: rgba(255,100,100,.3);
  border-color: rgba(255,100,100,.6);
}

@media (max-width: 640px) {
  .settings-card .btn-row {
    grid-template-columns: 1fr;
  }

  .settings-card .btn.warn {
    grid-column: 1;
  }
}
`;F("settings-control-card",ln);var cn=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,Al=T({tag:"settings-control-card",render:cn,onMount(e,t){t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{fe("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{fe("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{fe("restart")})}});var dn=`
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border: 1px solid rgba(255,133,49,.35);
  background: rgba(255,133,49,.12);
  border-radius: 10px;
  padding: 8px 10px;
  margin: 10px 0 2px;
}
`;F("settings-motor-calibration-card",dn);var vt=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:a.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:a.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:a.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:a.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:a.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:a.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:a.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:a.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:a.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:a.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:a.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:a.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],pn=()=>{let e="";for(let t=0;t<vt.length;t++){let o=vt[t],r=un(o.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label">'+o.label+" ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text">Motor Calibration &amp; Learning${ge("Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.")}</span></div>
      <div class="ui-row">
        <span class="ui-label">Motor Drivers</span>
        <span class="ui-field"><div class="ui-toggle mc-drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div></span>
      </div>
      <div class="ui-note">Default starting thresholds and learning bounds used by the motor controller.</div>

      <div class="ui-section">Profile</div>
      <div class="ui-row">
        <span class="ui-label">Motor Type (Default Profile)</span>
        <span class="ui-field"><select class="ui-select smc-profile">
          <option value="Generic">Generic</option>
          <option value="HmIP VdMot">HmIP VdMot</option>
        </select></span>
      </div>
      <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>

      <div class="ui-section">Thresholds &amp; Learning</div>
      ${e}
    </div>
  `};function un(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var ql=T({tag:"settings-motor-calibration-card",render:pn,onMount(e,t){let o=t.querySelector(".smc-profile"),r=t.querySelector(".smc-safe-runtime"),n=t.querySelector(".mc-drivers-toggle"),c=se(t);function i(s){if(s==="HmIP VdMot"&&ne("hmip_runtime_limit_seconds",40),s==="Generic"){let u=Number(S(a.genericRuntimeLimitSeconds));(!Number.isFinite(u)||u<=0)&&ne("generic_runtime_limit_seconds",45)}}c.toggle(n,{read:()=>U(a.drivers),commit:s=>ot(s)}),c.select(o,{read:()=>N(a.motorProfileDefault)||"HmIP VdMot",commit:s=>{de("motor_profile_default",s),i(s)}});function d(){let s=N(a.motorProfileDefault)||"HmIP VdMot";r.disabled=s==="HmIP VdMot"}c.num(r,{read:()=>(N(a.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:S(a.genericRuntimeLimitSeconds),commit:s=>{o.value==="Generic"&&ne("generic_runtime_limit_seconds",s)}});for(let s=0;s<vt.length;s++){let u=vt[s];if(u.key==="generic_runtime_limit_seconds")continue;let g=t.querySelector(".smc-"+u.cls);g&&(c.num(g,{read:()=>S(u.id),commit:b=>ne(u.key,b)}),w(u.id,c.refresh))}w(a.drivers,c.refresh),w(a.motorProfileDefault,()=>{c.refresh(),d()}),w(a.genericRuntimeLimitSeconds,c.refresh),w(a.hmipRuntimeLimitSeconds,c.refresh),i(N(a.motorProfileDefault)||"HmIP VdMot"),c.refresh(),d()}});var mn=`
.settings-asgard-card .asgard-role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.settings-asgard-card .asgard-role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}
.settings-asgard-card .asgard-role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-asgard-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
  margin-top: 8px;
}
.settings-asgard-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
  font-family: var(--mono);
}

.settings-asgard-card .status-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
  margin-top: 8px;
}
.settings-asgard-card .status-grid .val { color: var(--text); font-weight: 600; }
.settings-asgard-card .status-grid .val.warn { color: #FFE9A0; }
`;F("settings-asgard-card",mn);var fn=()=>`
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text">Modulating Heat Source${ge("Pushes the house-weighted room temperature to a modulating heat-source controller. One board is the coordinator and aggregates zones from both boards; the other is a slave.")}</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="ui-row">
      <span class="ui-label">Bridge enabled <span class="ui-sublabel">send weighted house temperature to the heat-source controller</span></span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" aria-label="Toggle heat-source bridge"></div></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label">Coordinator <span class="ui-sublabel">pushes to the heat source</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section">Heat Source Endpoint</div>
      <div class="ui-row">
        <span class="ui-label">Host</span>
        <span class="ui-field"><input class="ui-input wide sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Port</span>
        <span class="ui-field"><input class="ui-input sa-port" type="number" min="1" max="65535" step="1" placeholder="80" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Number entity <span class="ui-sublabel">REST object_id for the weighted house temp</span></span>
        <span class="ui-field"><input class="ui-input wide sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" /></span>
      </div>

      <div class="ui-section">Peer board</div>
      <div class="ui-row">
        <span class="ui-label">Peer host</span>
        <span class="ui-field"><input class="ui-input wide sa-peer" type="text" placeholder="empty = single board" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Push interval (s)</span>
        <span class="ui-field"><input class="ui-input sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" /></span>
      </div>

      <div class="ui-section">Recommended setpoint</div>
      <div class="setpoint-box">
        <span class="setpoint-val sa-st-setpoint">\u2014</span>
        <span class="ui-note">Fixed value to set as the virtual thermostat setpoint \u2014 the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
      </div>

      <div class="ui-section">Status</div>
      <div class="status-grid">
        <span>Peer</span><span class="val sa-st-peer">n/a</span>
        <span>Last push</span><span class="val sa-st-push">\u2014</span>
        <span>Zones weighted</span><span class="val sa-st-zones">\u2014</span>
        <span>Last error</span><span class="val sa-st-err">\u2014</span>
      </div>
    </div>
  </div>
`,Gl=T({tag:"settings-asgard-card",render:fn,onMount(e,t){let o=t.querySelector(".asgard-role-badge"),r=t.querySelector(".sa-enable"),n=t.querySelector(".sa-coord"),c=t.querySelector(".sa-host"),i=t.querySelector(".sa-port"),d=t.querySelector(".sa-entity"),s=t.querySelector(".sa-peer"),u=t.querySelector(".sa-interval"),g=t.querySelector(".sa-st-peer"),b=t.querySelector(".sa-st-push"),v=t.querySelector(".sa-st-setpoint"),f=t.querySelector(".sa-st-zones"),m=t.querySelector(".sa-st-err"),z=t.querySelector(".sa-body"),p=se(t);function _(A,H,D){return E=>{let M=E?"on":"off";x(A,{state:M}),de(H,M).catch(L=>{console.error(`[Asgard] Failed to update ${D}:`,L),x(A,{state:E?"off":"on"})})}}let k=A=>z.classList.toggle("is-disabled",!A);p.toggle(r,{read:()=>U(a.asgardEnabled),commit:_(a.asgardEnabled,"asgard_enabled","enabled"),onChange:k}),p.toggle(n,{read:()=>U(a.asgardCoordinator),commit:_(a.asgardCoordinator,"asgard_coordinator","coordinator")});function h(A,H){return D=>{x(A,{state:D}),ao(H,D).catch(E=>console.error(`[Asgard] Failed to update ${H}:`,E))}}p.text(c,{read:()=>N(a.asgardHost),commit:h(a.asgardHost,"asgard_host")}),p.text(d,{read:()=>N(a.asgardEntityName),commit:h(a.asgardEntityName,"asgard_entity_name")}),p.text(s,{read:()=>N(a.asgardPeerHost),commit:h(a.asgardPeerHost,"asgard_peer_host")});function y(A,H){return D=>{x(A,{value:D}),ne(H,D).catch(E=>console.error(`[Asgard] Failed to update ${H}:`,E))}}p.num(i,{read:()=>S(a.asgardPort),commit:y(a.asgardPort,"asgard_port")}),p.num(u,{read:()=>S(a.asgardPushIntervalS),commit:y(a.asgardPushIntervalS,"asgard_push_interval_s")});function C(){let A=N(a.asgardRole)||"slave";o.textContent=A,o.className="asgard-role-badge "+(A==="master"?"master":"slave");let H=N(a.asgardPeerStatus)||"n/a";g.textContent=H,g.classList.toggle("warn",H==="stale"||H==="unreachable");let D=S(a.asgardLastPushC),E=S(a.asgardLastPushAgeS);if(D!=null&&Number.isFinite(D)&&E!=null){let te=E<120?`${Math.round(E)}s ago`:`${Math.round(E/60)}m ago`;b.textContent=`${D.toFixed(2)}\xB0C (${te})`}else b.textContent="\u2014";let M=S(a.asgardSetpointC);v.textContent=M!=null&&Number.isFinite(M)?`${M.toFixed(1)}\xB0C`:"\u2014";let L=S(a.asgardLocalZones),W=S(a.asgardPeerZones);f.textContent=L!=null?`${L} local + ${W||0} peer`:"\u2014";let G=N(a.asgardLastError);m.textContent=G||"\u2014",m.classList.toggle("warn",!!G)}w(a.asgardEnabled,p.refresh),w(a.asgardCoordinator,p.refresh),w(a.asgardRole,C),w(a.asgardPeerStatus,C),w(a.asgardLastPushC,C),w(a.asgardSetpointC,C),w(a.asgardLastPushAgeS,C),w(a.asgardLocalZones,C),w(a.asgardPeerZones,C),w(a.asgardLastError,C),w(a.asgardHost,p.refresh),w(a.asgardEntityName,p.refresh),w(a.asgardPeerHost,p.refresh),w(a.asgardPort,p.refresh),w(a.asgardPushIntervalS,p.refresh),p.refresh(),C()}});var Uo=[1,2,3,4,5,6],gn=`
.settings-forecast-card .fc-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}
.settings-forecast-card .fc-badge.ok {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}
.settings-forecast-card .fc-badge.stale,
.settings-forecast-card .fc-badge.external {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border-color: rgba(255,200,50,.35);
}

.settings-forecast-card .fc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: .78rem;
}
.settings-forecast-card .fc-age {
  color: var(--text-secondary);
}
.settings-forecast-card .fc-error {
  color: #FFB4B4;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
.settings-forecast-card .fc-fetch-btn {
  margin-left: auto;
  padding: 4px 12px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  cursor: pointer;
  font-size: .78rem;
  font-weight: 700;
  transition: .18s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.settings-forecast-card .fc-fetch-btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,146,200,.52);
}
.settings-forecast-card .fc-fetch-btn:disabled {
  opacity: .5;
  cursor: default;
}

.settings-forecast-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; margin-top: 4px; }
.settings-forecast-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px;
}
.settings-forecast-card .zone-table th:first-child { text-align: left; }
.settings-forecast-card .zone-table td { padding: 4px 2px; text-align: center; }
.settings-forecast-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; }
.settings-forecast-card .zone-table .offset-cell { font-weight: 700; color: var(--text-secondary); font-family: var(--mono); }
.settings-forecast-card .zone-table .offset-cell.active { color: #CBFFD0; }
`;F("settings-forecast-card",gn);var bn=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,hn=()=>`
  <div class="ui-card settings-forecast-card">
    <div class="ui-card-title">
      <span class="ui-title-text">Forecast Preload${ge("Charges the slab before incoming weather: raises a zone setpoint when forecast wind on its exterior walls is about to spike. Solar gain offsets it. Fetched from Open-Meteo hourly.")}</span>
      <span class="fc-badge">disabled</span>
    </div>

    <div class="fc-meta">
      <span class="fc-age"></span>
      <span class="fc-error"></span>
      <button class="fc-fetch-btn">Fetch Now</button>
    </div>

    <div class="ui-row">
      <span class="ui-label">Wind preload enabled</span>
      <span class="ui-field"><div class="ui-toggle fc-enable" role="switch" aria-label="Toggle forecast preload"></div></span>
    </div>
    <div class="ui-note">Charges the slab before an incoming storm: raises a zone's setpoint when forecast wind hitting its exterior walls is about to spike. The fetched forecast is shown on the Monitor page.</div>

    <div class="gated-body fc-body">
      <div class="ui-section">Location</div>
      <div class="ui-row">
        <span class="ui-label">Latitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lat" type="number" min="-90" max="90" step="0.0001" placeholder="55.6761" data-nostep /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Longitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lon" type="number" min="-180" max="180" step="0.0001" placeholder="12.5683" data-nostep /></span>
      </div>

      <div class="ui-section">Model</div>
      <div class="ui-row">
        <span class="ui-label">Load threshold</span>
        <span class="ui-field"><input class="ui-input fc-threshold" type="number" min="0.1" max="10" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Max offset (\xB0C)</span>
        <span class="ui-field"><input class="ui-input fc-maxoffset" type="number" min="0" max="3" step="0.1" placeholder="1.5" /></span>
      </div>

      <div class="ui-section">Per-zone preload (now)</div>
      <table class="zone-table">
        <thead>
          <tr><th>Zone</th><th>Active offset</th></tr>
        </thead>
        <tbody class="fc-zone-body">
          ${Uo.map(bn).join("")}
        </tbody>
      </table>
      <div class="ui-note fc-note">Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.</div>
    </div>
  </div>
`,tc=T({tag:"settings-forecast-card",render:hn,onMount(e,t){let o=t.querySelector(".fc-badge"),r=t.querySelector(".fc-enable"),n=t.querySelector(".fc-body"),c=t.querySelector(".fc-lat"),i=t.querySelector(".fc-lon"),d=t.querySelector(".fc-threshold"),s=t.querySelector(".fc-maxoffset"),u=t.querySelector(".fc-age"),g=t.querySelector(".fc-error"),b=t.querySelector(".fc-fetch-btn"),v=se(t);function f(h){if(!h)return"";if(h<16e8)return"clock syncing\u2026";let y=new Date(h*1e3),C=y.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),A=new Date;return y.getFullYear()===A.getFullYear()&&y.getMonth()===A.getMonth()&&y.getDate()===A.getDate()?C:y.toLocaleDateString([],{month:"short",day:"numeric"})+" "+C}function m(){let h=f(S(a.forecastFetchEpoch));u.textContent=h?`Last fetch: ${h}`:"";let y=N(a.forecastLastError);g.textContent=y||""}b.addEventListener("click",()=>{b.disabled=!0,b.textContent="Fetching\u2026",fe("trigger_forecast_fetch").catch(()=>{}),setTimeout(()=>{Be()},15e3),setTimeout(()=>{b.disabled=!1,b.textContent="Fetch Now"},2e4)});let z=h=>{n&&n.classList.toggle("is-disabled",!h)};v.toggle(r,{read:()=>U(a.forecastEnabled),onChange:z,commit:h=>{let y=h?"on":"off";x(a.forecastEnabled,{state:y}),de("forecast_enabled",y).catch(C=>{console.error("[Forecast] toggle failed:",C),x(a.forecastEnabled,{state:h?"off":"on"})})}});function p(h,y){return C=>{x(h,{value:C}),ne(y,C).catch(A=>console.error(`[Forecast] ${y} failed:`,A))}}v.num(c,{nostep:!0,read:()=>S(a.forecastLatitude),commit:p(a.forecastLatitude,"forecast_latitude")}),v.num(i,{nostep:!0,read:()=>S(a.forecastLongitude),commit:p(a.forecastLongitude,"forecast_longitude")}),v.num(d,{read:()=>S(a.forecastLoadThreshold),commit:p(a.forecastLoadThreshold,"forecast_load_threshold")}),v.num(s,{read:()=>S(a.forecastMaxOffsetC),commit:p(a.forecastMaxOffsetC,"forecast_max_offset_c")});function _(){let h=N(a.forecastStatus)||"disabled";o.textContent=h,o.className="fc-badge",h==="ok"?o.classList.add("ok"):(h==="stale"||h.indexOf("external")>=0)&&o.classList.add("external")}function k(){t.querySelectorAll(".fc-zone-body tr").forEach(h=>{let y=parseInt(h.getAttribute("data-zone"),10),C=h.querySelector(".fc-offset"),A=S(l.forecastOffset(y)),H=S(l.forecastPeakH(y));A!=null&&A>.01?(C.textContent=`+${A.toFixed(1)}\xB0`+(H!=null&&H>=0?` (${H}h)`:""),C.classList.add("active")):(C.textContent="\u2014",C.classList.remove("active"))})}w(a.forecastStatus,_),w(a.forecastEnabled,()=>{v.refresh(),_()}),w(a.forecastLatitude,v.refresh),w(a.forecastLongitude,v.refresh),w(a.forecastLoadThreshold,v.refresh),w(a.forecastMaxOffsetC,v.refresh),w(a.forecastFetchEpoch,m),w(a.forecastLastError,m),Uo.forEach(h=>{w(l.forecastOffset(h),k)}),_(),m(),k(),v.refresh()}});var Yo=[1,2,3,4,5,6],xn=`
.settings-balancing-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; margin-top: 4px; }
.settings-balancing-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px;
}
.settings-balancing-card .zone-table th:first-child { text-align: left; }
.settings-balancing-card .zone-table td { padding: 4px 2px; text-align: center; font-family: var(--mono); color: var(--text-secondary); }
.settings-balancing-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; font-family: inherit; }
.settings-balancing-card .zone-table .eff { color: var(--text-strong); font-weight: 700; }
.settings-balancing-card .zone-table .err.cold { color: #FFB4B4; }
.settings-balancing-card .zone-table .err.warm { color: #CBFFD0; }
.settings-balancing-card .bal-reset { width: 100%; }
`;F("settings-balancing-card",xn);var vn=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="bal-static">\u2014</td>
    <td class="bal-adapt">\u2014</td>
    <td class="bal-eff eff">\u2014</td>
    <td class="bal-err err">\u2014</td>
  </tr>
`,yn=()=>`
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span class="ui-title-text">Hydraulic Balancing${ge("Scales raw valve positions by pipe length and zone area so long loops get proportionally more flow. Adaptive mode tunes the factors over time.")}</span></div>

    <div class="ui-row">
      <span class="ui-label">Balancing mode</span>
      <span class="ui-field"><select class="ui-select bal-mode">
        <option>Static</option>
        <option>Adaptive</option>
      </select></span>
    </div>
    <div class="ui-note">Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top \u2014 no return probes \u2014 nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.</div>

    <div class="ui-section">Per-zone factors</div>
    <table class="zone-table">
      <thead>
        <tr><th>Zone</th><th>Prior</th><th>Learned</th><th>Effective</th><th>Error</th></tr>
      </thead>
      <tbody class="bal-zone-body">
        ${Yo.map(vn).join("")}
      </tbody>
    </table>
    <div class="ui-note">Prior = static design factor \xB7 Learned = adaptive multiplier \xB7 Effective = prior \xD7 learned (the valve scale applied). Error is the long-window setpoint\u2212room average a cold (+) loop is boosted on, a warm (\u2212) loop throttled.</div>

    <div class="gated-body bal-adaptive-body">
      <div class="ui-section">Adaptive tuning</div>
      <div class="ui-row">
        <span class="ui-label">Update interval (s)</span>
        <span class="ui-field"><input class="ui-input bal-interval" type="number" min="60" max="86400" step="60" placeholder="3600" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Step (k)</span>
        <span class="ui-field"><input class="ui-input bal-step" type="number" min="0.001" max="0.2" step="0.01" placeholder="0.02" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Min factor</span>
        <span class="ui-field"><input class="ui-input bal-min" type="number" min="0.1" max="1" step="0.05" placeholder="0.5" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Max factor</span>
        <span class="ui-field"><input class="ui-input bal-max" type="number" min="1" max="3" step="0.05" placeholder="1.5" /></span>
      </div>
      <button class="ui-btn warn bal-reset" type="button">Reset balancing</button>
      <div class="ui-note">Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.</div>
    </div>
  </div>
`,cc=T({tag:"settings-balancing-card",render:yn,onMount(e,t){let o=t.querySelector(".bal-mode"),r=t.querySelector(".bal-adaptive-body"),n=t.querySelector(".bal-interval"),c=t.querySelector(".bal-step"),i=t.querySelector(".bal-min"),d=t.querySelector(".bal-max"),s=se(t),u=f=>{r&&r.classList.toggle("is-disabled",f!=="Adaptive")};s.select(o,{read:()=>N(a.balanceMode)||"Static",commit:f=>de("balance_mode",f)}),o.addEventListener("change",()=>u(o.value));function g(f,m){return z=>{x(f,{value:z}),ne(m,z).catch(p=>console.error(`[Balancing] ${m} failed:`,p))}}s.num(n,{read:()=>S(a.adaptIntervalS),commit:g(a.adaptIntervalS,"adapt_interval_s")}),s.num(c,{read:()=>S(a.adaptStep),commit:g(a.adaptStep,"adapt_step")}),s.num(i,{read:()=>S(a.adaptMin),commit:g(a.adaptMin,"adapt_min")}),s.num(d,{read:()=>S(a.adaptMax),commit:g(a.adaptMax,"adapt_max")}),t.querySelector(".bal-reset").addEventListener("click",()=>{mo().catch(f=>console.error("[Balancing] reset failed:",f))});let b=(f,m=2)=>f!=null&&Number.isFinite(Number(f))?Number(f).toFixed(m):"\u2014";function v(){t.querySelectorAll(".bal-zone-body tr").forEach(f=>{let m=parseInt(f.getAttribute("data-zone"),10);f.querySelector(".bal-static").textContent=b(S(l.staticFactor(m))),f.querySelector(".bal-adapt").textContent=b(S(l.balanceAdapt(m))),f.querySelector(".bal-eff").textContent=b(S(l.balanceFactor(m)));let z=S(l.adaptErr(m)),p=f.querySelector(".bal-err");if(p.classList.remove("cold","warm"),z==null||!Number.isFinite(Number(z)))p.textContent="\u2014";else{p.textContent=(z>=0?"+":"")+Number(z).toFixed(2);let _=z>.05?"cold":z<-.05?"warm":"";_&&p.classList.add(_)}})}w(a.balanceMode,()=>{s.refresh(),u(N(a.balanceMode)||"Static")}),w(a.adaptIntervalS,s.refresh),w(a.adaptStep,s.refresh),w(a.adaptMin,s.refresh),w(a.adaptMax,s.refresh),Yo.forEach(f=>{w(l.staticFactor(f),v),w(l.balanceAdapt(f),v),w(l.balanceFactor(f),v),w(l.adaptErr(f),v)}),s.refresh(),u(N(a.balanceMode)||"Static"),v()}});var wn=`
.smart-preheat-card .absorb-badge {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.smart-preheat-card .absorb-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}
`;F("smart-preheat-card",wn);var _n=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text">Preheat${ge("When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing \u2014 absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.")}</span></div>
    <div class="ui-row">
      <span class="ui-label">Preheat Absorption <span class="absorb-badge">idle</span></span>
      <span class="ui-field"><div class="ui-toggle absorb-toggle" role="switch" aria-label="Toggle preheat absorption"></div></span>
    </div>
    <div class="ui-note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
    <div class="gated-body absorb-body">
      <div class="ui-row">
        <span class="ui-label">Absorb band (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Detect delta (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  </div>
`,hc=T({tag:"smart-preheat-card",render:_n,onMount(e,t){let o=t.querySelector(".absorb-toggle"),r=t.querySelector(".absorb-badge"),n=t.querySelector(".absorb-band"),c=t.querySelector(".absorb-delta"),i=t.querySelector(".absorb-body"),d=se(t),s=g=>{i&&i.classList.toggle("is-disabled",!g)};d.toggle(o,{read:()=>U(a.preheatAbsorbEnabled),onChange:s,commit:g=>{let b=g?"on":"off";x(a.preheatAbsorbEnabled,{state:b}),de("preheat_absorb_enabled",b)}}),d.num(n,{read:()=>S(a.preheatAbsorbBandC),commit:g=>{x(a.preheatAbsorbBandC,{value:g}),ne("preheat_absorb_band_c",g)}}),d.num(c,{read:()=>S(a.preheatDetectDeltaC),commit:g=>{x(a.preheatDetectDeltaC,{value:g}),ne("preheat_detect_delta_c",g)}});function u(){let g=String(N(a.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=g?"active":"idle",r.classList.toggle("active",g)}w(a.preheatAbsorbEnabled,d.refresh),w(a.preheatAbsorbing,u),w(a.preheatAbsorbBandC,d.refresh),w(a.preheatDetectDeltaC,d.refresh),d.refresh(),u()}});var zn=`
.settings-smart-heating {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

/* De-chrome the nested cards so they sit flush inside this panel. */
.settings-smart-heating .smart-preheat-card,
.settings-smart-heating .settings-forecast-card {
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
}

/* The inner card titles ("Preheat" / "Forecast Preload") become subsection heads. */
.settings-smart-heating .sh-section + .sh-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--panel-border);
}
`;F("settings-smart-heating",zn);var Sn=()=>`
  <div class="settings-smart-heating">
    <div class="sh-section sh-preheat-slot"></div>
    <div class="sh-section sh-forecast-slot"></div>
  </div>
`,wc=T({tag:"settings-smart-heating-card",render:Sn,onMount(e,t){t.querySelector(".sh-preheat-slot").appendChild(Z("smart-preheat-card")),t.querySelector(".sh-forecast-slot").appendChild(Z("settings-forecast-card"))}});var kn=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");

:root {
  /* ===========================================================
     Palette (sunset ramp, cool-dark \u2192 warm-light):
       #00202e #003f5c #2c4875 #8a508f #bc5090
       #ff6361 #ff8531 #ffa600 #ffd380
     Dark cool tones \u2192 surfaces/borders; orange \u2192 primary accent,
     purple \u2192 secondary/cool (no blue in the UI or charts); warm
     members \u2192 data series + states. Greens for "OK" status are kept
     (the palette has no green) for status legibility.
     =========================================================== */
  --accent: #ff8531;          /* orange \u2014 primary accent */
  --blue: #8a508f;            /* purple \u2014 secondary / cool accent (replaces blue) */
  /* Chart data series \u2014 orange (warm) + purple (cool), no blue. */
  --series-warm: #ff8531;
  --series-cool: #8a508f;
  --series-cool-fill: rgba(138,80,143,.16);
  --series-solar: #ffc14d;    /* gold \u2014 solar irradiance / current-hour highlight */
  /* Axis/tick label color \u2014 warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(233,222,210,.82);
  --bg: #00202e;
  --surface: #003f5c;
  --card: #042a3b;
  --border: rgba(120,146,200,.22);
  --text: #FFFFFF;
  --text-strong: #FFF4E6;
  --text-secondary: rgba(255,239,224,.84);
  --muted: rgba(247,233,221,.74);
  --text-faint: rgba(229,216,222,.56);
  --text-on-accent: #00202e;
  --soft: rgba(124,155,208,.12);
  --panel-border: rgba(120,146,200,.28);
  --panel-bg: linear-gradient(180deg, rgba(0,63,92,.40), rgba(0,32,46,.40));
  --panel-bg-vibrant: radial-gradient(900px 300px at 90% -40%, rgba(255,166,0,.14), transparent 62%), linear-gradient(180deg, rgba(0,63,92,.44), rgba(0,32,46,.40));
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.42);
  --state-ok: #79d17e;
  --state-warn: #ffa600;
  --state-danger: #ff6361;
  --state-disabled: #6E7E96;
  --control-bg: rgba(124,155,208,.10);
  --control-bg-hover: rgba(124,155,208,.16);
  --control-border: rgba(120,146,200,.30);
  --control-border-strong: rgba(120,146,200,.45);
  --viz-flow-low: #8a508f;
  --viz-flow-mid: #bc5090;
  --viz-flow-high: #ff8531;
  --viz-flow-hot: #ffa600;
  --viz-delta-low: #8a508f;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #ff6361;
  --green: #79d17e;
  --red: #ff6361;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 12px; scroll-behavior: smooth; }
body {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(255,133,49,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(138,80,143,.16), transparent 64%),
    var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.app {
  display: block;
  min-height: 100vh;
}

.shell {
  padding: 18px;
  width: min(1320px, 100%);
  margin: 0 auto;
}

.sec {
  display: none;
  margin-bottom: 22px;
}

.sec.active {
  display: block;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > * {
  flex: 1;
}

.zone-layout,
.logs-layout {
  display: grid;
  gap: 14px;
}

/* Logs: main log stream (2/3) + stacked diagnostics column (1/3). */
.logs-layout {
  grid-template-columns: 2fr 1fr;
  align-items: start;
}

.logs-main-col,
.logs-side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot,
.zone-recovery-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > *,
.zone-recovery-slot > * {
  flex: 1;
}

/* Middle column stacks the sensor (connectivity) and fault/relearn cards,
   stretching to match the Zone and Zone Settings columns' height. */
.zone-mid-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
/* Slots grow to share the column's full height so the stack matches the Zone
   and Zone Settings columns (no gap left below the last card). */
.zone-mid-col > * { width: 100%; flex: 1 1 auto; }

/* Single row of 4 equal-height columns; cards stretch to fill via flex. */
.settings-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  align-items: stretch;
}
.settings-layout > * { display: flex; }
.settings-layout > * > * { flex: 1; }
/* Balancing card carries a 6-zone table \u2014 give it the full row below the four. */
.settings-balancing-slot { grid-column: 1 / -1; }

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: linear-gradient(180deg, rgba(0,63,92,.40), rgba(0,32,46,.40));
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
}

.placeholder-card h3 {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
}

.placeholder-card p {
  color: var(--muted);
  font-size: .86rem;
}

@media (max-width: 1200px) {
  .settings-layout { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .logs-layout { grid-template-columns: 1fr; }

  .zone-detail-slot {
    grid-column: 1;
  }
}

/* ============================
   GLOBAL INTERACTIVE STATES
   ============================ */

/* Consistent focus ring for all interactive elements */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid rgba(124,155,208,.72);
  outline-offset: 2px;
}

/* Disabled state for all buttons/inputs */
button:disabled,
input:disabled,
select:disabled {
  opacity: .40;
  cursor: not-allowed;
  pointer-events: none;
}

/* Gated card body: faded + non-interactive when its feature is disabled.
   The enable toggle stays outside this wrapper so it remains clickable. */
.gated-body {
  transition: opacity .2s ease;
}
.gated-body.is-disabled {
  opacity: .42;
  pointer-events: none;
  user-select: none;
}
`;F("app-root",kn);var En=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-forecast" style="margin-top:14px"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
          <div class="overview-flow-return"></div>
        </div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-mid-col">
            <div class="zone-sensor-slot"></div>
            <div class="zone-recovery-slot"></div>
          </div>
          <div class="zone-room-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="settings">
        <div class="settings-layout">
          <div class="settings-manifold-slot"></div>
          <div class="settings-asgard-slot"></div>
          <div class="settings-motor-cal-slot"></div>
          <div class="settings-smart-heating-slot"></div>
          <div class="settings-balancing-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="logs">
        <div class="logs-layout">
          <div class="logs-main-col"></div>
          <div class="logs-side-col"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;T({tag:"app-root",render:En,onMount(e,t){t.querySelector(".hdr").appendChild(Z("hv6-header")),t.querySelector(".overview-flow").appendChild(Z("flow-diagram")),t.querySelector(".overview-forecast").appendChild(Z("monitor-forecast-preview")),t.querySelector(".overview-timeline").appendChild(Z("zone-state-timeline")),t.querySelector(".overview-flow-return").appendChild(Z("graph-widgets",{variant:"flow-return"})),t.querySelector(".zone-selector").appendChild(Z("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(Z("zone-detail",{zone:I("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(Z("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(Z("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(Z("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(Z("settings-manifold-card")),t.querySelector(".settings-asgard-slot").appendChild(Z("settings-asgard-card")),t.querySelector(".settings-motor-cal-slot").appendChild(Z("settings-motor-calibration-card")),t.querySelector(".settings-smart-heating-slot").appendChild(Z("settings-smart-heating-card")),t.querySelector(".settings-balancing-slot").appendChild(Z("settings-balancing-card"));let o=t.querySelector(".logs-main-col");o.appendChild(Z("logs-view")),o.appendChild(Z("diag-activity"));let r=t.querySelector(".logs-side-col");r.appendChild(Z("connectivity-card")),r.appendChild(Z("diag-system-card")),r.appendChild(Z("preheat-factors-card")),r.appendChild(Z("diag-zone-motor-card",{zone:I("selectedZone")||1})),r.appendChild(Z("settings-control-card")),r.appendChild(Z("diag-manual-badge")),r.appendChild(Z("diag-i2c"));let n=t.querySelectorAll(".sec");function c(){let i=I("section");n.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===i)})}R("section",c),c()}});function Cn(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(Z("app-root")),Mt()}Cn();})();
