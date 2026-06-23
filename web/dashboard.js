(()=>{var Ft={},Oe={};function L(e){return Ft[e.tag]=e,e}function R(e,t){let r=Ft[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let s=r.state(t||{});for(let u in s)o[u]=s[u]}if(r.methods)for(let s in r.methods)o[s]=r.methods[s];let i=document.createElement("div");i.innerHTML=r.render(o);let d=i.firstElementChild;return r.onMount&&r.onMount(o,d),d}function x(e,t){(Oe[e]||(Oe[e]=[])).push(t)}function V(e){let t=Oe[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var U=6,Io=28,Pe=Object.create(null),Zo=jo(),D={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Wo(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Zo,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0,forecastHours:null},$o=300;function Wo(){let e=Object.create(null);for(let t=1;t<=U;t++)e[t]=[];return e}function jo(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<U;)e.push("");return e.slice(0,U)}function Vo(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(D.zoneNames))}catch(e){}}function X(e){return"$dashboard:"+e}function pt(e){return Math.max(1,Math.min(U,Number(e)||1))}function Mt(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function S(e){let t=Pe[e];return t?t.v!=null?t.v:t.value!=null?t.value:Mt(t.s!=null?t.s:t.state):null}function F(e){let t=Pe[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Go(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function $(e){return Go(F(e))}function g(e,t){let r=Pe[e];r||(r=Pe[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);if(V(e),e==="text_sensor-firmware_version"&&be("firmwareVersion",F(e)||""),e.startsWith("text-zone_")&&e.endsWith("_name")){let o=parseInt(e.slice(10,-5),10);if(o>=1&&o<=U){let i=F(e)||"";D.zoneNames[o-1]!==i&&(D.zoneNames[o-1]=i,Vo(),V(X("zoneNames")))}}}function T(e,t){x(X(e),t)}function O(e){return D[e]}function be(e,t){D[e]=t,V(X(e))}function At(e){D.section!==e&&(D.section=e,V(X("section")))}function Nt(e){let t=pt(e);D.selectedZone!==t&&(D.selectedZone=t,V(X("selectedZone")))}function he(e){let t=!!e;D.live!==t&&(D.live=t,V(X("live")))}function Dt(){D.pendingWrites+=1,V(X("pendingWrites"))}function ut(){D.pendingWrites=Math.max(0,D.pendingWrites-1),D.lastWriteAt=Date.now(),V(X("pendingWrites"))}function Tt(){return D.pendingWrites>0?!0:Date.now()-D.lastWriteAt<2e3}function le(e){return D.zoneNames[pt(e)-1]||""}function oe(e){let t=pt(e),r=le(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function ve(e){D.i2cResult=e||"No scan has been run yet.",V(X("i2cResult"))}function M(e,t){let r={time:Uo(),msg:String(e||"")};for(D.activityLog.push(r);D.activityLog.length>60;)D.activityLog.shift();if(t>=1&&t<=U){let o=D.zoneLog[t];for(o.push(r);o.length>8;)o.shift();V(X("zoneLog:"+t))}V(X("activityLog"))}function Ot(e){return e>=1&&e<=U?D.zoneLog[e]:D.activityLog}function dt(e,t){let r=D[e];if(!Array.isArray(r))return;let o=Mt(t);if(o!=null){for(r.push(o);r.length>Io;)r.shift();V(X(e))}}function Se(e){let t=Date.now();if(!e&&t-D.lastHistoryAt<3200)return;D.lastHistoryAt=t;let r=0,o=0;for(let i=1;i<=U;i++){let d=S("sensor-zone_"+i+"_valve_pct");d!=null&&(r+=d,o+=1)}dt("historyFlow",S("sensor-manifold_flow_temperature")),dt("historyReturn",S("sensor-manifold_return_temperature")),dt("historyDemand",o?r/o:0)}function Uo(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function qe(e){D.zoneStateHistory=e||null,V(X("zoneStateHistory"))}function Pt(){return D.deviceLogSeq}function Re(e,t){if(Array.isArray(e)&&e.length){for(let r of e)D.deviceLog.push({seq:r[0],level:r[1],tag:r[2],msg:r[3]}),r[0]>D.deviceLogSeq&&(D.deviceLogSeq=r[0]);for(;D.deviceLog.length>$o;)D.deviceLog.shift();V(X("deviceLog"))}typeof t=="number"&&t>D.deviceLogSeq&&(D.deviceLogSeq=t-1)}function qt(){return D.deviceLog}function Rt(){D.deviceLog=[],V(X("deviceLog"))}function He(e){D.forecastHours=e||null,V(X("forecastHours"))}function Ht(){return D.forecastHours}var p={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",name:e=>"text-zone_"+e+"_name",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h",staticFactor:e=>"sensor-zone_"+e+"_static_factor",balanceFactor:e=>"sensor-zone_"+e+"_balance_factor",balanceAdapt:e=>"sensor-zone_"+e+"_balance_adapt",adaptErr:e=>"sensor-zone_"+e+"_adapt_err"},a={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFetchEpoch:"sensor-forecast_fetch_epoch",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c",balanceMode:"select-balance_mode",adaptIntervalS:"number-adapt_interval_s",adaptStep:"number-adapt_step",adaptMin:"number-adapt_min",adaptMax:"number-adapt_max",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var j=6,Xo=8,Bt=null,xe=0,Be=1,It=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[3,"hv6_forecast","Forecast updated: 48 hours from Open-Meteo"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],N={temp:new Float32Array(j),setpoint:new Float32Array(j),valve:new Float32Array(j),enabled:new Uint8Array(j),driversEnabled:1,fault:0,manualMode:0};function Yo(){N.manualMode=0,be("manualMode",!1);for(let c=0;c<j;c++){N.temp[c]=20.5+c*.4,N.setpoint[c]=21+c%3*.5,N.valve[c]=12+c*8,N.enabled[c]=c===4?0:1;let m=c+1;g(p.temp(m),{value:N.temp[c]}),g(p.setpoint(m),{value:N.setpoint[c]}),g(p.valve(m),{value:N.valve[c]}),g(p.state(m),{state:N.valve[c]>5?"heating":"idle"}),g(p.enabled(m),{value:!!N.enabled[c],state:N.enabled[c]?"on":"off"}),g(p.probe(m),{state:"Probe "+m}),g(p.tempSource(m),{state:m%2?"Local Probe":"BLE"}),g(p.syncTo(m),{state:"None"}),g(p.pipeType(m),{state:"PEX 16mm"}),g(p.area(m),{value:8+m*3.5}),g(p.spacing(m),{value:[150,200,150,100,200,150][c]}),g(p.ble(m),{state:"AA:BB:CC:DD:EE:0"+m}),g(p.name(m),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][c]||""}),g(p.exteriorWalls(m),{state:["N","E","S","W","N,E","S,W"][c]}),g(p.windExposure(m),{value:[.5,.5,.5,.5,.7,.7][c]}),g(p.solarGain(m),{value:.3}),g(p.thermalLeadH(m),{value:4}),g(p.preheatAdvance(m),{value:.08+c*.03});let v=[.62,.78,1,.55,.88,.7][c],w=[1.08,.95,1,1.15,.9,1.02][c];g(p.staticFactor(m),{value:v}),g(p.balanceAdapt(m),{value:w}),g(p.balanceFactor(m),{value:Math.min(1,v*w)}),g(p.adaptErr(m),{value:[.12,-.05,0,.22,-.1,.03][c]})}for(let c=1;c<=Xo;c++){let m=c<=j?c:j,v=N.temp[m-1]+(c>j?1:.1*c);g(p.probeTemp(c),{value:v})}g(a.flow,{value:34.1}),g(a.ret,{value:30.4}),g(a.uptime,{value:18*3600+720}),g(a.wifi,{value:-57}),g(a.drivers,{value:!0,state:"on"}),g(a.fault,{value:!1,state:"off"}),g(a.ip,{state:"192.168.1.86"}),g(a.ssid,{state:"MockLab"}),g(a.mac,{state:"D8:3B:DA:12:34:56"}),g(a.firmware,{state:"0.5.x-mock"}),g(a.manifoldFlowProbe,{state:"Probe 7"}),g(a.manifoldReturnProbe,{state:"Probe 8"}),g(a.manifoldType,{state:"NC (Normally Closed)"}),g(a.motorProfileDefault,{state:"HmIP VdMot"}),g(a.closeThresholdMultiplier,{value:1.7}),g(a.closeSlopeThreshold,{value:1}),g(a.closeSlopeCurrentFactor,{value:1.4}),g(a.openThresholdMultiplier,{value:1.7}),g(a.openSlopeThreshold,{value:.8}),g(a.openSlopeCurrentFactor,{value:1.3}),g(a.openRippleLimitFactor,{value:1}),g(a.genericRuntimeLimitSeconds,{value:45}),g(a.hmipRuntimeLimitSeconds,{value:40}),g(a.relearnAfterMovements,{value:2e3}),g(a.relearnAfterHours,{value:168}),g(a.learnedFactorMinSamples,{value:3}),g(a.learnedFactorMaxDeviationPct,{value:12}),g(a.simplePreheatEnabled,{state:"on"}),g(a.balanceMode,{state:"Adaptive"}),g(a.adaptIntervalS,{value:3600}),g(a.adaptStep,{value:.02}),g(a.adaptMin,{value:.5}),g(a.adaptMax,{value:1.5}),g(a.minZoneFlowPct,{value:15}),g(a.minimumFlowAlways,{state:"off"}),g(a.cpuLoadCore0,{value:18.5}),g(a.cpuLoadCore1,{value:7.2}),g(a.freeInternalKb,{value:142}),g(a.freePsramKb,{value:7800}),Se(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],i=[];for(let c=0;c<r;c++){let m=(r-1-c)*e,v=t-m,w=Math.floor(c/12)%24,b=o.map(z=>z[w%z.length]),h=m/3600,_=h>2.5&&h<3.5||h>8.5&&h<9.5?1:0,y=b.filter(z=>z===5).length,l=Math.round(Math.min(100,y*15+Math.abs(Math.sin(c/8))*6)),n=Number((30+y*1.4+Math.sin(c/11)*1.5).toFixed(1)),f=Number((n-(1.4+y*.35)).toFixed(1));i.push([v,...b,_,n,f,l])}qe({interval_s:e,uptime_s:t,count:r,entries:i});let d=[];for(let c=0;c<48;c++){let m=6-3*Math.sin(c/24*Math.PI)-(c>10&&c<20?2:0),v=4+(c>8&&c<18?9*Math.exp(-Math.pow(c-13,2)/12):0)+Math.sin(c/5),w=(220+c*4)%360,b=c%24,h=Math.max(0,Math.round(820*Math.sin((b-6)/12*Math.PI)));d.push([Number(m.toFixed(1)),Number(Math.max(0,v).toFixed(1)),Math.round(w),h])}let s=new Date(t*1e3);s.setHours(0,0,0,0);let u=Math.floor(s.getTime()/1e3);He({base_epoch:u,age_s:480,fetch_epoch:t-480,count:48,hours:d}),Zt(6)}function Zt(e){let t=[];for(let r=0;r<e;r++){let o=It[Be%It.length];t.push([Be,o[0],o[1],o[2]]),Be++}Re(t,Be)}function Ko(){xe+=1,g(a.uptime,{value:Number(Date.now()/1e3)|0}),g(a.wifi,{value:-55-Math.round((1+Math.sin(xe/4))*6)});let e=0,t=0,r=0;for(let s=0;s<j;s++){let u=s+1,c=!!N.enabled[s],m=N.temp[s],v=N.setpoint[s],w=c&&N.driversEnabled&&!N.manualMode&&m<v-.25;N.manualMode?N.valve[s]=Math.max(0,N.valve[s]):!c||!N.driversEnabled?N.valve[s]=Math.max(0,N.valve[s]-6):w?N.valve[s]=Math.min(100,N.valve[s]+7+u%3):N.valve[s]=Math.max(0,N.valve[s]-5);let b=w?.05+N.valve[s]/2200:-.03+N.valve[s]/3200;N.temp[s]=m+b+Math.sin((xe+u)/5)*.04,c&&N.valve[s]>0&&(e+=N.valve[s],t+=1,r=Math.max(r,N.valve[s])),g(p.temp(u),{value:N.temp[s]}),g(p.valve(u),{value:Math.round(N.valve[s])});let h=Math.max(0,(N.setpoint[s]-N.temp[s]-.15)*.22);g(p.preheatAdvance(u),{value:Number(h.toFixed(2))}),g(p.state(u),{state:c?w?"heating":"idle":"off"}),g(p.enabled(u),{value:c,state:c?"on":"off"}),g(p.probeTemp(u),{value:N.temp[s]+Math.sin((xe+u)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(xe/6)*.25,i=o-(t?2.1+e/Math.max(1,t*50):1.1);g(a.flow,{value:Number(o.toFixed(1))}),g(a.ret,{value:Number(i.toFixed(1))}),g(p.probeTemp(7),{value:Number((i-.4).toFixed(1))}),g(p.probeTemp(8),{value:Number((o+.2).toFixed(1))}),Se(!0);let d=O("zoneStateHistory");d&&(d.uptime_s=Number(Date.now()/1e3)|0),xe%3===0&&Zt(1)}function $t(){Bt||(Yo(),he(!0),Bt=setInterval(Ko,1200))}function Ie(e){var d;let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=j){let s=Number(r);Number.isNaN(s)||(N.setpoint[o-1]=s,g(p.setpoint(o),{value:s}),M("Zone "+o+" setpoint set to "+s.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=j){let s=r>.5;N.enabled[o-1]=s?1:0,g(p.enabled(o),{value:s,state:s?"on":"off"}),M("Zone "+o+(s?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let s=r>.5;N.driversEnabled=s?1:0,g(a.drivers,{value:s,state:s?"on":"off"}),M(s?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let s=r>.5;N.manualMode=s?1:0,be("manualMode",s);return}if(t==="motor_target"&&o>=1&&o<=j){let s=Number(r||0);g(p.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(s)))}),M("Motor "+o+" target set to "+s+"%",o);return}if(t==="command"){let s=String(r);if(s==="i2c_scan"){ve(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),M("I2C scan complete");return}if(s==="calibrate_all_motors"||s==="restart"){M("Command executed: "+s);return}if(s==="open_motor_timed"&&o>=1&&o<=j){M("Motor "+o+" open timed",o);return}if(s==="close_motor_timed"&&o>=1&&o<=j){M("Motor "+o+" close timed",o);return}if(s==="stop_motor"&&o>=1&&o<=j){M("Motor "+o+" stopped",o);return}if(s==="motor_reset_fault"&&o>=1&&o<=j){M("Motor "+o+" fault reset",o);return}if(s==="motor_reset_learned_factors"&&o>=1&&o<=j){M("Motor "+o+" learned factors reset",o);return}if(s==="motor_reset_and_relearn"&&o>=1&&o<=j){M("Motor "+o+" reset and relearn started",o);return}if(s==="dump_task_stats"){M("Task stats dumped to device log (mock)");return}if(s==="reset_balancing"){for(let u=1;u<=j;u++)g(p.balanceAdapt(u),{value:1}),g(p.balanceFactor(u),{value:(d=S(p.staticFactor(u)))!=null?d:1}),g(p.adaptErr(u),{value:null});M("Adaptive balancing reset");return}return}if(t==="zone_probe"&&o>=1){g(p.probe(o),{state:String(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){g(p.tempSource(o),{state:String(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){g(p.syncTo(o),{state:String(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){g(p.pipeType(o),{state:String(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){g(a.manifoldType,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){g(a.manifoldFlowProbe,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){g(a.manifoldReturnProbe,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){g(a.motorProfileDefault,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){g(a.simplePreheatEnabled,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="minimum_flow_always"){g(a.minimumFlowAlways,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="balance_mode"){g(a.balanceMode,{state:String(r)}),M("Setting updated: "+t+" = "+r);return}if(t==="zone_name"&&o>=1){g(p.name(o),{state:String(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_ble_mac"&&o>=1){g(p.ble(o),{state:String(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){let s=String(r)||"None";g(p.exteriorWalls(o),{state:s});let u=s==="None"?0:s.split(",").filter(Boolean).length,c=[0,.5,.7,.85,1][Math.min(u,4)];g(p.windExposure(o),{value:c}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){g(p.area(o),{value:Number(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){g(p.spacing(o),{value:Number(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_wind_exposure"&&o>=1){g(p.windExposure(o),{value:Number(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_solar_gain"&&o>=1){g(p.solarGain(o),{value:Number(r)}),M("Setting updated: "+t+" = "+r,o);return}if(t==="zone_thermal_lead_h"&&o>=1){g(p.thermalLeadH(o),{value:Number(r)}),M("Setting updated: "+t+" = "+r,o);return}let i={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax,min_zone_flow_pct:a.minZoneFlowPct};if(i[t]){let s=Number(r);Number.isNaN(s)||(g(i[t],{value:s}),M("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){Ie({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!N.enabled[e-1];Ie({key:"zone_enabled",value:t?1:0,zone:e})}};var Ze="/api/hv6/v1";function $e(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function K(e,t,r){if(Dt(),$e())try{return Ie(r),Promise.resolve({ok:!0})}finally{ut()}let o=new URLSearchParams;for(let[s,u]of Object.entries(t||{}))u!=null&&o.append(s,u);let i=o.toString(),d=Ze+e+(i?"?"+i:"");return fetch(d,{method:"POST"}).then(s=>(s.ok||console.warn(`API call failed: POST ${e} status=${s.status}`),s)).catch(s=>{throw console.error(`API call error: POST ${e}:`,s),s}).finally(()=>{ut()})}function mt(e,t){return g(p.setpoint(e),{value:t}),K(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function Wt(e,t){return g(p.enabled(e),{state:t?"on":"off",value:t}),K(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function We(e){return g(a.drivers,{state:e?"on":"off",value:e}),K("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function re(e,t){return K("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function jt(){return ve("Scanning I2C bus..."),M("I2C scan started"),re("i2c_scan")}var Jo={zone_probe:e=>p.probe(e),zone_temp_source:e=>p.tempSource(e),zone_sync_to:e=>p.syncTo(e),zone_pipe_type:e=>p.pipeType(e)},Qo={zone_ble_mac:e=>p.ble(e),zone_exterior_walls:e=>p.exteriorWalls(e),zone_name:e=>p.name(e)},er={zone_area_m2:e=>p.area(e),zone_pipe_spacing_mm:e=>p.spacing(e)},tr={manifold_type:a.manifoldType,manifold_flow_probe:a.manifoldFlowProbe,manifold_return_probe:a.manifoldReturnProbe,motor_profile_default:a.motorProfileDefault,simple_preheat_enabled:a.simplePreheatEnabled,balance_mode:a.balanceMode},or={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax};function ye(e,t,r){let o=Jo[t];return o&&g(o(e),{state:r}),K("/settings/select",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function ke(e,t,r){let o=Qo[t];return o&&g(o(e),{state:r}),K("/settings/text",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function we(e,t,r){let o=Number(r),i=er[t];return i&&!Number.isNaN(o)&&g(i(e),{value:o}),K("/settings/number",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function J(e,t){let r=tr[e];return r&&g(r,{state:t}),K("/settings/select",{key:e,value:t},{key:e,value:t})}function Q(e,t){let r=Number(t),o=or[e];return o&&!Number.isNaN(r)&&g(o,{value:r}),K("/settings/number",{key:e,value:r},{key:e,value:r})}function Vt(e,t){return K("/settings/text",{key:e,value:t},{key:e,value:t})}function Gt(e,t){let r=String(t||"").trim();return M("Zone "+e+" renamed to "+(r||"(blank)"),e),ke(e,"zone_name",r)}function Ut(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return g(p.motorTarget(e),{value:o}),M("Motor "+e+" target set to "+o+"%",e),K(`/motors/${e}/target`,{value:o},{key:"motor_target",value:o,zone:e})}function Xt(e,t=1e4){return M("Motor "+e+" open for "+t+"ms",e),K(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function Yt(e,t=1e4){return M("Motor "+e+" close for "+t+"ms",e),K(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function ft(e){return M("Motor "+e+" stopped",e),K(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function gt(e){return be("manualMode",!!e),M(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),K("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function Kt(e){return M("Motor "+e+" fault reset",e),re("motor_reset_fault",e)}function Jt(e){return M("Motor "+e+" learned factors reset",e),re("motor_reset_learned_factors",e)}function Qt(e){return M("Motor "+e+" reset and relearn started",e),re("motor_reset_and_relearn",e)}function eo(){return M("Adaptive balancing reset \u2014 learned factors back to 1.0"),re("reset_balancing")}function to(){return M("Task stats dumped to device log"),re("dump_task_stats")}function bt(){$e()||fetch(Ze+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&qe(e)}).catch(()=>{})}function ht(){if($e())return;let e=Pt();fetch(Ze+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Re(t.lines,t.next_seq)}).catch(()=>{})}function Ce(){$e()||fetch(Ze+"/forecast",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&He(e)}).catch(()=>{})}var vt=null,je=null,oo=null,ro=null,ao=null;async function rr(){je&&je.abort(),je=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:je.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function no(e){if(!(!e||typeof e!="object")&&!Tt()){for(let t in e)g(t,e[t]);Se(!1)}}function ar(e){if(e){if(!e.type){no(e);return}if(e.type==="state"){no(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;M(t),String(t).indexOf("I2C_SCAN:")!==-1&&ve(String(t))}}}function so(){vt||(vt=setTimeout(()=>{vt=null,xt()},1e3))}function xt(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){$t();return}rr().then(t=>{he(!0),ar(t),bt(),oo||(oo=setInterval(bt,300*1e3)),ht(),ro||(ro=setInterval(ht,3e3)),Ce(),ao||(ao=setInterval(Ce,300*1e3)),so()}).catch(()=>{he(!1),so()})}var io=Object.create(null);function k(e,t){if(io[e])return;io[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}var nr=`
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
`;k("ui-kit",nr);function ae(e){return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}">?<span class="help-tip">${e}</span></span>`}function sr(e,t){let r=Math.abs(Number(e));return!Number.isFinite(r)||r<1e3?t:Math.pow(10,Math.floor(Math.log10(r))-1)}function ir(e){let t=String(e),r=t.indexOf(".");return r<0?0:t.length-r-1}function Y(e,t={}){let r=e.querySelector(t.title||".ui-card-title"),o=document.createElement("div");o.className="ui-form-banner",o.innerHTML='<span class="ui-form-banner-msg">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard">Discard</button><button type="button" class="ui-form-apply">Apply</button></span>',r?r.insertAdjacentElement("afterend",o):e.insertAdjacentElement("afterbegin",o);let i=[],d=()=>o.classList.toggle("show",i.some(l=>l.dirty)),s=(l,n)=>{l.dirty=n,d()};function u(l){return l.markDirty=()=>s(l,!0),i.push(l),l}function c(l,n){let f={dirty:!1,input:l},z=n.baseStep!=null?n.baseStep:parseFloat(l.step)||1,C=ir(z),q=n.min!=null?n.min:l.min!==""?parseFloat(l.min):-1/0,P=n.max!=null?n.max:l.max!==""?parseFloat(l.max):1/0,A=E=>C>0?Number(E).toFixed(C):String(Math.round(Number(E)));if(!n.nostep){let E=document.createElement("div");E.className="ui-stepper",l.parentNode.insertBefore(E,l);let H=document.createElement("button");H.type="button",H.className="ui-step-btn",H.textContent="\u2212",H.tabIndex=-1,H.setAttribute("aria-label","decrease");let Z=document.createElement("button");Z.type="button",Z.className="ui-step-btn",Z.textContent="+",Z.tabIndex=-1,Z.setAttribute("aria-label","increase"),E.appendChild(H),E.appendChild(l),E.appendChild(Z),l.readOnly=!0;let W=G=>{if(l.disabled)return;let I=parseFloat(l.value);Number.isFinite(I)||(I=parseFloat(l.placeholder)),Number.isFinite(I)||(I=0);let ue=Math.min(P,Math.max(q,I+G*sr(I,z)));l.value=A(ue),s(f,!0)};H.addEventListener("click",()=>W(-1)),Z.addEventListener("click",()=>W(1)),l.addEventListener("dblclick",()=>{l.disabled||(l.readOnly=!1,l.classList.add("editing"),l.focus(),l.select())}),l.addEventListener("blur",()=>{l.readOnly=!0,l.classList.remove("editing")}),l.addEventListener("keydown",G=>{G.key==="Enter"&&l.blur()})}return l.addEventListener("input",()=>s(f,!0)),f.sync=()=>{let E=n.read();l.value=E!=null&&Number.isFinite(Number(E))?A(E):""},f.commit=()=>{let E=parseFloat(l.value);Number.isFinite(E)&&n.commit(Math.min(P,Math.max(q,E)))},u(f)}function m(l,n){let f={dirty:!1,input:l};return l.addEventListener("input",()=>s(f,!0)),f.sync=()=>{let z=n.read();l.value=z!=null?z:""},f.commit=()=>n.commit(l.value.trim()),u(f)}function v(l,n){let f={dirty:!1,input:l};return l.addEventListener("change",()=>s(f,!0)),f.sync=()=>{let z=n.read();z!=null&&(l.value=z)},f.commit=()=>n.commit(l.value),u(f)}function w(l,n){let f={dirty:!1,input:l,staged:!1},z=l.closest(".ui-row"),C=()=>{l.classList.toggle("on",f.staged),z&&z.classList.toggle("is-on",f.staged),l.setAttribute("aria-checked",f.staged?"true":"false"),n.onChange&&n.onChange(f.staged)};return l.addEventListener("click",()=>{f.staged=!f.staged,s(f,!0),C()}),f.sync=()=>{f.staged=!!n.read(),C()},f.commit=()=>n.commit(f.staged),u(f)}function b(l){let n={dirty:!1,sync:l.sync,commit:l.commit};return u(n)}let h=()=>i.forEach(l=>{!l.dirty&&l.sync&&l.sync()}),_=()=>{i.forEach(l=>{l.dirty&&(l.commit&&l.commit(),l.dirty=!1)}),d(),t.onApply&&t.onApply()},y=()=>{i.forEach(l=>{l.dirty=!1,l.sync&&l.sync()}),d(),t.onDiscard&&t.onDiscard()};return o.querySelector(".ui-form-apply").addEventListener("click",_),o.querySelector(".ui-form-discard").addEventListener("click",y),{num:c,text:m,select:v,toggle:w,custom:b,refresh:h,apply:_,discard:y,isDirty:()=>i.some(l=>l.dirty)}}function ee(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function Ve(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Ge(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function lo(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var lr=`
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
  /* Stat pills (uptime / wifi / asgard) ride to the very top, above brand + menu. */
  .top-meta { order: -2; justify-items: center; }
  .top-brand { order: -1; justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;k("hv6-header",lr);var cr=()=>`
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
          <span class="meta-chip" id="hdr-asgard" hidden><span class="meta-chip-label">Asgard</span><span class="meta-chip-value" id="hdr-asgard-val">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,Cn=L({tag:"hv6-header",render:cr,onMount(e,t){let r=t.querySelector("#hdr-dot"),o=t.querySelector("#hdr-sync"),i=t.querySelector("#hdr-up"),d=t.querySelector("#hdr-wifi"),s=t.querySelector("#hdr-asgard"),u=t.querySelector("#hdr-asgard-val"),c=t.querySelector("#hdr-fw"),m=t.querySelectorAll(".menu-link");function v(){let b=O("section");m.forEach(h=>{h.classList.toggle("active",h.getAttribute("data-section")===b)})}function w(){let b=O("live"),h=O("pendingWrites"),_=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);r.classList.toggle("on",!!b);let y,l;h>0?(y="Saving\u2026",l="saving"):_?(y=window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock",l="synced"):b?(y="Live",l="synced"):(y="Offline",l="offline"),o.textContent=y,o.className="meta-chip meta-chip-state "+l,i.textContent=Ge(S(a.uptime)),d.textContent=lo(S(a.wifi));let n=S(a.asgardLastPushC),f=$(a.asgardEnabled)&&n!=null&&Number.isFinite(n);s.hidden=!f,f&&(u.textContent=n.toFixed(2)+"\xB0C");let z=O("firmwareVersion")||F(a.firmware);c.textContent=z?"FW "+z:""}m.forEach(b=>{b.addEventListener("click",h=>{h.preventDefault(),At(b.getAttribute("data-section"))})}),T("section",v),T("live",w),T("pendingWrites",w),T("firmwareVersion",w),x(a.uptime,w),x(a.wifi,w),x(a.asgardLastPushC,w),x(a.asgardEnabled,w),x(a.firmware,w),v(),w()}});var dr=`
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
`;k("status-card",dr);var pr=e=>`
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
`,Dn=L({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:pr,methods:{update(e){this.motorDriversOn=$(a.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=$(a.fault)?"FAULT":"OK",this.connOn=O("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);x(a.drivers,o),x(a.fault,o),T("live",o),r.sw.onclick=()=>{We(!e.motorDriversOn)},o()}});var ur=`
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
`;k("connectivity-card",ur);var mr=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Bn=L({tag:"connectivity-card",render:mr,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),i=t.querySelector(".cc-mac"),d=t.querySelector(".cc-up");function s(){r.textContent=F(a.ip)||"---",o.textContent=F(a.ssid)||"---",i.textContent=F(a.mac)||"---",d.textContent=Ge(S(a.uptime))}x(a.ip,s),x(a.ssid,s),x(a.mac,s),x(a.uptime,s),s()}});var fr="http://www.w3.org/2000/svg",gr=`
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
`;k("chart-kit",gr);function B(e,t,r){let o=document.createElementNS(fr,e);if(t)for(let i in t)o.setAttribute(i,t[i]);return r!=null&&(o.textContent=r),o}function _e(e){if(!e.length)return"";if(e.length<3)return"M "+e.map(o=>`${o.x.toFixed(2)} ${o.y.toFixed(2)}`).join(" L ");let t=.16,r=`M ${e[0].x.toFixed(2)} ${e[0].y.toFixed(2)}`;for(let o=0;o<e.length-1;o++){let i=e[o-1]||e[o],d=e[o],s=e[o+1],u=e[o+2]||s,c=d.x+(s.x-i.x)*t,m=d.y+(s.y-i.y)*t,v=s.x-(u.x-d.x)*t,w=s.y-(u.y-d.y)*t;r+=` C ${c.toFixed(2)} ${m.toFixed(2)}, ${v.toFixed(2)} ${w.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return r}function co(e,t,r){let o=e.filter(u=>Number.isFinite(u));if(!o.length)return{min:t,max:r};let i=Math.min(...o),d=Math.max(...o);i===d&&(i-=1,d+=1);let s=(d-i)*.12;return{min:i-s,max:d+s}}function Ue(e,t,r){let o=document.createElement("div");o.className="chart-tooltip",t.appendChild(o);let i=B("g",{class:"chart-cursor",style:"display:none"}),d=B("line",{class:"chart-cursor-line",y1:r.plotTop,y2:r.plotBottom});i.appendChild(d);let s=[];e.appendChild(i);function u(w){let b=0,h=1/0;for(let _=0;_<r.count;_++){let y=Math.abs(w-r.xAt(_));y<h&&(h=y,b=_)}return b}function c(w){let b=e.getScreenCTM();if(!b)return null;let h=e.createSVGPoint();return h.x=w.clientX,h.y=w.clientY,h.matrixTransform(b.inverse())}function m(w){if(!r.count)return;let b=c(w);if(!b)return;let h=u(b.x),_=r.xAt(h);d.setAttribute("x1",_),d.setAttribute("x2",_);let y=r.dots(h);for(;s.length<y.length;){let z=B("circle",{class:"chart-cursor-dot",r:3.4});i.appendChild(z),s.push(z)}s.forEach((z,C)=>{C<y.length?(z.setAttribute("cx",_),z.setAttribute("cy",y[C].y),z.setAttribute("fill",y[C].color),z.style.display=""):z.style.display="none"}),i.style.display="";let l=r.rows(h).map(z=>`<div class="tt-row"><span class="tt-swatch" style="background:${z.color}"></span>${z.label}<span class="tt-val">${z.value}</span></div>`).join("");o.innerHTML=`<div class="tt-time">${r.label(h)}</div>${l}`,o.classList.add("show");let n=t.getBoundingClientRect(),f=w.clientX-n.left+14;f+o.offsetWidth>n.width-6&&(f=w.clientX-n.left-o.offsetWidth-14),o.style.left=Math.max(6,f)+"px",o.style.top=Math.max(6,w.clientY-n.top+12)+"px"}function v(){o.classList.remove("show"),i.style.display="none"}return e.addEventListener("pointermove",m),e.addEventListener("pointerleave",v),()=>{e.removeEventListener("pointermove",m),e.removeEventListener("pointerleave",v),o.remove()}}function Xe(e){return'<div class="chart-legend">'+e.map(t=>`<span class="chart-legend-item" style="color:${t.color}"><span class="chart-legend-marker"></span><span style="color:var(--text-secondary)">${t.label}</span></span>`).join("")+"</div>"}var _t=480,Ye=210,me=14,br=14,hr=34,fe=42,zt=_t-fe-br,Ee=Ye-me-hr,Le=me+Ee,vo=24*3600,po=U+2,uo=U+3,mo=U+4,xo="var(--series-warm)",yo="var(--series-cool)",vr="var(--series-cool)",xr=`
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(138,80,143,.10), rgba(0,32,46,.34));
}
`;k("graph-widgets",xr);var fo=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title">Flow / Return</span><span class="chart-sub gw-dt">\u2014</span></div>'+Xe([{color:xo,label:"Flow"},{color:yo,label:"Return"}])+'<svg class="gw-flow"></svg></div>',go=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',yr=e=>e.variant==="flow-return"?`<div class="graph-widgets">${fo()}</div>`:e.variant==="demand"?`<div class="graph-widgets">${go()}</div>`:`<div class="graph-widgets">${fo()}${go()}</div>`;function bo(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1):"\u2014"}function wo(e,t,r){let o=[];for(let i=0;i<e.length;i++){let d=e[i];if(!d||d[0]<r)continue;let s=d[t];s==null||!Number.isFinite(s)||o.push({t:d[0],v:s})}return o}var yt=(e,t)=>fe+Math.max(0,Math.min(1,(e-t)/vo))*zt;function wr(e,t){let r=[];if(e.forEach(s=>s.forEach(u=>r.push(u.v))),!r.length)return t==="%"?{min:0,max:100}:{min:0,max:10};let o=Math.min(...r),i=Math.max(...r);if(t==="%"&&(o=0,i=Math.min(100,i)),o===i){let s=t==="%"?5:.5;o-=s,i+=s}let d=(i-o)*.1;return t!=="%"&&(o-=d),i+=d,t==="%"&&(o=Math.max(0,o),i=Math.min(100,i)),{min:o,max:i}}function ho(e,t,r,o,i,d,s,u){e.innerHTML="",e.setAttribute("viewBox",`0 0 ${_t} ${Ye}`),e.setAttribute("preserveAspectRatio","xMidYMid meet");let c=r.map(y=>wo(d,y.index,s));if(!c.some(y=>y.length))return e.appendChild(B("text",{x:_t/2,y:Ye/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let{min:m,max:v}=wr(c,o),w=Math.max(.001,v-m),b=y=>me+(1-(y-m)/w)*Ee;for(let y=0;y<3;y++){let l=y/2,n=me+l*Ee;e.appendChild(B("line",{x1:fe,y1:n,x2:fe+zt,y2:n,class:"chart-grid"})),e.appendChild(B("text",{x:fe-6,y:n+4,"text-anchor":"end",class:"chart-tick"},bo(v-w*l,o)))}e.appendChild(B("line",{x1:fe,y1:Le,x2:fe+zt,y2:Le,class:"chart-axis"})),e.appendChild(B("text",{x:9,y:me+Ee/2,transform:`rotate(-90 9 ${(me+Ee/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},i)),[24,12,0].forEach(y=>{let l=yt(u-y*3600,s);e.appendChild(B("text",{x:l,y:Ye-10,"text-anchor":y===24?"start":y===0?"end":"middle",class:"chart-hour"+(y===0?" now":"")},y===0?"now":"-"+y+"h"))}),r.forEach((y,l)=>{let n=c[l].map(z=>({x:yt(z.t,s),y:b(z.v)}));if(!n.length)return;let f=_e(n);y.fill&&e.appendChild(B("path",{d:f+` L ${n[n.length-1].x.toFixed(1)} ${Le} L ${n[0].x.toFixed(1)} ${Le} Z`,fill:y.fill,stroke:"none"})),e.appendChild(B("path",{d:f,fill:"none",stroke:y.color,"stroke-width":String(y.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let h=[];for(let y=0;y<d.length;y++){let l=d[y];if(!l||l[0]<s)continue;let n=r.map(f=>l[f.index]);n.every(f=>f==null||!Number.isFinite(f))||h.push({t:l[0],vals:n})}if(!h.length)return null;let _=Date.now();return Ue(e,t,{count:h.length,plotTop:me,plotBottom:Le,xAt:y=>yt(h[y].t,s),label:y=>new Date(_-(u-h[y].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:y=>r.map((l,n)=>({y:b(h[y].vals[n]),color:l.color})).filter((l,n)=>Number.isFinite(h[y].vals[n])),rows:y=>r.map((l,n)=>({color:l.color,label:l.label,value:bo(h[y].vals[n],o)+(o==="%"?"":"\xB0")})).filter((l,n)=>Number.isFinite(h[y].vals[n]))})}function wt(e,t,r){let o=wo(e,t,r);return o.length?o[o.length-1].v:null}var Un=L({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:yr,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),i=t.querySelector(".gw-flow"),d=t.querySelector(".gw-demand"),s=null,u=null;function c(){let m=O("zoneStateHistory"),v=m&&Array.isArray(m.entries)?m.entries:[],w=m&&m.uptime_s||Number(Date.now()/1e3)|0,b=w-vo;if(i){s&&s();let h=wt(v,po,b),_=wt(v,uo,b);r.textContent=h!=null&&_!=null?"\u0394 "+(h-_).toFixed(1)+"\xB0":"\u2014",s=ho(i,i.closest(".chart-card"),[{index:po,color:xo,label:"Flow",width:2.4},{index:uo,color:yo,label:"Return",width:2}],"C","Temp",v,b,w)}if(d){u&&u();let h=wt(v,mo,b);o.textContent=h!=null?Math.round(h)+"%":"\u2014",u=ho(d,d.closest(".chart-card"),[{index:mo,color:vr,label:"Demand",width:2.2,fill:"var(--series-cool-fill)"}],"%","Demand",v,b,w)}}T("zoneStateHistory",c),c()}});var ce={0:{label:"Off",color:"#2c4875"},1:{label:"Manual",color:"#d07bb5"},2:{label:"Calibrating",color:"#ffd380"},3:{label:"Wait Cal.",color:"#6B5C84"},4:{label:"Wait Temp",color:"#6B5C84"},5:{label:"Heating",color:"#ff8531"},6:{label:"Idle",color:"#39354c"},7:{label:"Overheated",color:"#ff6361"},255:{label:"",color:"transparent"}},_o=24*3600,Fe=18,kt=4,ge=54,Je=20,Me=4,Qe=10,So=6,ko="#bc5090",zo=U+1,Co=Me+U*(Fe+kt)-kt,St=Co+So,Ke=Co+So+Qe+Je,_r=`
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
`;k("zone-state-timeline",_r);var zr=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Sr(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,i=o-_o,d=1e3,s=d-ge;function u(_){let y=(_-i)/_o;return ge+Math.max(0,Math.min(1,y))*s}let c="http://www.w3.org/2000/svg",m=document.createElementNS(c,"svg");m.setAttribute("viewBox","0 0 "+d+" "+Ke),m.classList.add("timeline-svg");let v=document.createElementNS(c,"rect");v.setAttribute("x",ge),v.setAttribute("y",Me),v.setAttribute("width",s),v.setAttribute("height",Ke-Me-Je),v.setAttribute("fill","rgba(0,32,46,0.55)"),v.setAttribute("rx","4"),m.appendChild(v);let w=[6,12,18,24];for(let _ of w){let y=o-_*3600,l=u(y),n=document.createElementNS(c,"line");n.setAttribute("x1",l),n.setAttribute("y1",Me),n.setAttribute("x2",l),n.setAttribute("y2",Ke-Je),n.setAttribute("stroke","rgba(120,146,200,.16)"),n.setAttribute("stroke-width","1"),m.appendChild(n)}for(let _=0;_<U;_++){let y=Me+_*(Fe+kt),l=document.createElementNS(c,"rect");l.setAttribute("x",ge),l.setAttribute("y",y),l.setAttribute("width",s),l.setAttribute("height",Fe),l.setAttribute("fill",_%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),m.appendChild(l);let n=document.createElementNS(c,"text");n.setAttribute("x",ge-4),n.setAttribute("y",y+Fe/2+1),n.setAttribute("text-anchor","end"),n.setAttribute("dominant-baseline","middle"),n.setAttribute("fill","rgba(233,222,210,.62)"),n.setAttribute("font-size","9.5"),n.setAttribute("font-family","Montserrat, sans-serif"),n.setAttribute("font-weight","600"),n.textContent="Z"+(_+1),m.appendChild(n);let f=r.filter(P=>P[0]>=i).map(P=>({t:P[0],state:P[_+1]}));if(f.length===0)continue;let z=f[0].t,C=f[0].state,q=(P,A,E)=>{if(E===255)return;let H=ce[E]||ce[255];if(H.color==="transparent")return;let Z=u(P),W=u(A),G=Math.max(1,W-Z),I=document.createElementNS(c,"rect");I.setAttribute("x",Z),I.setAttribute("y",y+1),I.setAttribute("width",G),I.setAttribute("height",Fe-2),I.setAttribute("fill",H.color),I.setAttribute("rx","2"),I.setAttribute("opacity","0.88"),m.appendChild(I)};for(let P=1;P<f.length;P++){let A=f[P];A.state!==C&&(q(z,A.t,C),z=A.t,C=A.state)}q(z,o,C)}{let _=document.createElementNS(c,"rect");_.setAttribute("x",ge),_.setAttribute("y",St),_.setAttribute("width",s),_.setAttribute("height",Qe),_.setAttribute("fill","rgba(188,80,144,0.10)"),_.setAttribute("rx","2"),m.appendChild(_);let y=document.createElementNS(c,"text");y.setAttribute("x",ge-4),y.setAttribute("y",St+Qe/2+1),y.setAttribute("text-anchor","end"),y.setAttribute("dominant-baseline","middle"),y.setAttribute("fill","rgba(233,222,210,.62)"),y.setAttribute("font-size","8.5"),y.setAttribute("font-family","Montserrat, sans-serif"),y.setAttribute("font-weight","600"),y.textContent="Absorb",m.appendChild(y);let l=r.filter(n=>n[0]>=i).map(n=>({t:n[0],on:n.length>zo?n[zo]:0}));if(l.length){let n=(C,q)=>{let P=u(C),A=Math.max(1,u(q)-P),E=document.createElementNS(c,"rect");E.setAttribute("x",P),E.setAttribute("y",St),E.setAttribute("width",A),E.setAttribute("height",Qe),E.setAttribute("fill",ko),E.setAttribute("rx","2"),E.setAttribute("opacity","0.9"),m.appendChild(E)},f=l[0].t,z=l[0].on;for(let C=1;C<l.length;C++)l[C].on!==z&&(z&&n(f,l[C].t),f=l[C].t,z=l[C].on);z&&n(f,o)}}let b=Ke-Je+14,h=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let _ of h){let y=o-_.hoursAgo*3600,l=u(y),n=document.createElementNS(c,"text");n.setAttribute("x",l),n.setAttribute("y",b),n.setAttribute("text-anchor",_.hoursAgo===0?"end":"middle"),n.setAttribute("fill","rgba(202,219,248,.78)"),n.setAttribute("font-size","9"),n.setAttribute("font-family","Montserrat, sans-serif"),n.textContent=_.label,m.appendChild(n)}return m}function kr(e){e.innerHTML="";let t=[{code:5,...ce[5]},{code:6,...ce[6]},{code:0,...ce[0]},{code:1,...ce[1]},{code:7,...ce[7]},{code:2,...ce[2]}];for(let o of t){let i=document.createElement("div");i.className="tl-legend-item",i.innerHTML='<span class="tl-legend-dot" style="background:'+o.color+'"></span>'+o.label,e.appendChild(i)}let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot" style="background:'+ko+'"></span>Preheat absorption',e.appendChild(r)}var es=L({tag:"zone-state-timeline",render:zr,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");kr(o);function i(){let d=O("zoneStateHistory"),s=(()=>{let c=O&&O("zoneStateHistory");return c&&c.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!d||!d.entries||d.entries.length===0){let c=document.createElement("div");c.className="timeline-empty",c.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(c);return}let u=Sr(d,s);u&&r.appendChild(u)}T("zoneStateHistory",i),T("zoneNames",i),i()}});var Cr=`
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
`;k("zone-grid",Cr);var Lr=()=>'<div class="zone-grid"></div>',as=L({tag:"zone-grid",render:Lr,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(R("zone-card",{zone:r}))}});var Er=`
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
}

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
`;k("zone-card",Er);var Fr=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${oe(e.zone)}</div>
		<div class="zc-friendly">${le(e.zone)||"---"}</div>
	</div>
`,ps=L({tag:"zone-card",state:e=>({zone:e.zone}),render:Fr,onMount(e,t){let r=e.zone,o=p.temp(r),i=p.state(r),d=p.enabled(r),s=t.querySelector(".zc-state-label"),u=t.querySelector(".zc-dot"),c=t.querySelector(".zc-zone-name"),m=t.querySelector(".zc-friendly");function v(){let w=$(d),b=String(F(i)||"").toUpperCase()||"OFF",h=String(F(p.motorLastFault(r))||"").toUpperCase(),_=h&&h!=="NONE"&&h!=="OK",y=w&&(b==="FAULT"||_)?"FAULT":b,l=O("selectedZone")===r,n=le(r);c.textContent=oe(r),m.textContent=n||ee(S(o)),s.textContent=w?y:"OFF",t.title=_?"Fault: "+h:"";let f=w?y:"OFF",z=f==="HEATING"?"#ffd380":f==="IDLE"?"#79d17e":f==="FAULT"?"#ff6361":"#6E7E96",C=f==="HEATING"?"#ff8531":f==="IDLE"?"#79d17e":f==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";s.style.color=z,u.style.background=C,u.style.boxShadow=f==="HEATING"?"0 0 5px rgba(255,133,49,.6)":f==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",l),t.classList.toggle("disabled",!w),t.classList.toggle("zs-heating",w&&f==="HEATING"),t.classList.toggle("zs-fault",w&&f==="FAULT"),t.classList.toggle("zs-idle",w&&f!=="HEATING"&&f!=="FAULT"),t.classList.toggle("zs-off",!w)}t.addEventListener("click",()=>{Nt(r)}),x(o,v),x(i,v),x(d,v),x(p.motorLastFault(r),v),T("selectedZone",v),T("zoneNames",v),v()}});var Mr=`
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
`;k("zone-detail",Mr);var Ar=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${oe(e.zone)}</div>
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
`;function Lo(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Eo(e){return e!=null?Number(e).toFixed(0):"---"}function Nr(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var xs=L({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Ar,methods:{update(e,t){let r=O("selectedZone"),o=String(F(p.state(r))||"").toUpperCase(),i=$(p.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=oe(r),t.setpoint.textContent=ee(S(p.setpoint(r))),t.temp.textContent=ee(S(p.temp(r))),t.ret.textContent=ee(S("sensor-manifold_return_temperature")),t.valve.textContent=Ve(S(p.valve(r)));let d=t.badge;d.textContent=i?o||"IDLE":"DISABLED";let s=i?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";d.className="zd-badge"+(s?" "+s:""),t.toggle.classList.toggle("on",i),t.orip.textContent=Eo(S(p.motorOpenRipples(r))),t.crip.textContent=Eo(S(p.motorCloseRipples(r))),t.ofac.textContent=Lo(S(p.motorOpenFactor(r))),t.cfac.textContent=Lo(S(p.motorCloseFactor(r))),t.ph.textContent=Nr(S(p.preheatAdvance(r)));let u=String(F(p.motorLastFault(r))||"").toUpperCase(),c=u&&u!=="NONE"&&u!=="OK";t.fault.hidden=!c,c&&(t.faultVal.textContent=u)},incSetpoint(){let e=this.zone,t=S(p.setpoint(e))||20;mt(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=S(p.setpoint(e))||20;mt(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=$(p.enabled(e));Wt(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),i=d=>{let s=O("selectedZone");(d===p.temp(s)||d===p.setpoint(s)||d===p.valve(s)||d===p.state(s)||d===p.enabled(s))&&o()};for(let d=1;d<=6;d++)x(p.temp(d),i),x(p.setpoint(d),i),x(p.valve(d),i),x(p.state(d),i),x(p.enabled(d),i),x(p.motorOpenRipples(d),o),x(p.motorCloseRipples(d),o),x(p.motorOpenFactor(d),o),x(p.motorCloseFactor(d),o),x(p.preheatAdvance(d),o),x(p.motorLastFault(d),o);x("sensor-manifold_return_temperature",o),T("selectedZone",o),o()}});var Dr=`
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
`;k("zone-sensor-card",Dr);var Tr=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
    </div>
  `};function Or(e,t){let r=e.value,o="<option>None</option>";for(let i=1;i<=6;i++)i!==t&&(o+="<option>Zone "+i+"</option>");e.innerHTML=o,e.value=r||"None"}function Pr(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function qr(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function Rr(e,t){let r="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==r&&(e.innerHTML=r),e.value=t}var Ls=L({tag:"zone-sensor-card",render:Tr,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),i=t.querySelector(".zs-ble"),d=t.querySelector(".zs-sync"),s=t.querySelector(".zs-row-ble"),u=t.querySelector(".zs-scan"),c=t.querySelector(".zs-scan-list"),m=0;function v(){return O("selectedZone")}function w(){s.style.display=o.value==="BLE Sensor"?"":"none"}let b=Y(t);Rr(o,"Local Probe"),b.select(r,{read:()=>F(p.probe(v()))||void 0,commit:l=>ye(v(),"zone_probe",l)}),b.select(o,{read:()=>Pr(String(F(p.tempSource(v()))||"")),commit:l=>ye(v(),"zone_temp_source",qr(l))}),b.select(d,{read:()=>F(p.syncTo(v()))||"None",commit:l=>ye(v(),"zone_sync_to",l)});let h=b.text(i,{read:()=>F(p.ble(v()))||"",commit:l=>ke(v(),"zone_ble_mac",l)});o.addEventListener("change",w);function _(){let l=v();m!==l?(Or(d,l),m=l,c.style.display="none",b.discard()):b.refresh(),w()}function y(l){let n=v();(l===p.probe(n)||l===p.tempSource(n)||l===p.syncTo(n)||l===p.ble(n))&&(b.refresh(),w())}u.addEventListener("click",()=>{if(u.disabled)return;u.disabled=!0,u.textContent="\u2026",c.style.display="",c.innerHTML='<div class="scan-msg">Scanning\u2026</div>';let l=new AbortController,n=setTimeout(()=>l.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:l.signal}).then(f=>{if(!f.ok)throw new Error("HTTP "+f.status);return f.json()}).then(f=>{if(clearTimeout(n),u.disabled=!1,u.textContent="Scan",!f.ok||!f.sensors||f.sensors.length===0){c.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let z=v(),C=(F(p.ble(z))||"").toUpperCase(),q=A=>String(A).replace(/[&<>"']/g,E=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[E]),P="";for(let A of f.sensors){let E=A.mac.toUpperCase(),H=A.name?q(A.name):"",Z=A.temp_c!=null?A.temp_c.toFixed(1)+"\xB0C":"\u2014",W=A.rssi!=null?A.rssi+" dBm":"",G=A.age_s<60?A.age_s+"s ago":Math.round(A.age_s/60)+"m ago",I="";E===C?I='<span class="ble-badge">assigned to this zone</span>':A.zone>0&&(I='<span class="ble-badge">zone '+A.zone+"</span>");let ue=H?`<div class="ble-mac">${H}</div><div class="ble-meta">${E}</div>`:`<div class="ble-mac">${E}</div>`;P+=`<div class="ble-scan-item">
              <div>
                ${ue}
                <div class="ble-meta">${Z} &nbsp;${W} &nbsp;${G}</div>
                ${I}
              </div>
              <button class="btn-assign" data-mac="${E}">Assign</button>
            </div>`}c.innerHTML=P,c.querySelectorAll(".btn-assign").forEach(A=>{A.addEventListener("click",()=>{i.value=A.dataset.mac,h.markDirty(),c.style.display="none"})})}).catch(f=>{clearTimeout(n),u.disabled=!1,u.textContent="Scan";let z=f&&f.name==="AbortError"?"Scan timed out \u2014 device busy or BLE not responding. Try again.":"Scan failed. Check device connectivity.";c.innerHTML='<div class="scan-msg">'+z+"</div>"})}),T("selectedZone",_);for(let l=1;l<=6;l++)x(p.probe(l),y),x(p.tempSource(l),y),x(p.syncTo(l),y),x(p.ble(l),y);_()}});var Hr=[0,.5,.7,.85,1];function Br(e){return Hr[Math.min(e,4)]}var Ir=`
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
`;k("zone-room-card",Ir);var Zr=()=>`
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
`,Os=L({tag:"zone-room-card",render:Zr,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),i=t.querySelector(".zr-spacing"),d=t.querySelector(".zr-pipe"),s=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn"),u=t.querySelector(".zr-wind"),c=t.querySelector(".zr-solar"),m=t.querySelector(".zr-lead");function v(){return O("selectedZone")}let w=Y(t);w.text(r,{read:()=>le(v())||"",commit:n=>Gt(v(),n)}),w.num(o,{read:()=>S(p.area(v())),commit:n=>we(v(),"zone_area_m2",n)}),w.num(i,{read:()=>S(p.spacing(v())),commit:n=>we(v(),"zone_pipe_spacing_mm",n||200)}),w.select(d,{read:()=>F(p.pipeType(v()))||"Unknown",commit:n=>ye(v(),"zone_pipe_type",n)});let b=w.num(u,{read:()=>S(p.windExposure(v())),commit:n=>we(v(),"zone_wind_exposure",n)});w.num(c,{read:()=>S(p.solarGain(v())),commit:n=>we(v(),"zone_solar_gain",n)}),w.num(m,{read:()=>S(p.thermalLeadH(v())),commit:n=>we(v(),"zone_thermal_lead_h",n)});let h=[];function _(){s.forEach(n=>{let f=n.dataset.wall;n.classList.toggle("active",f==="None"?h.length===0:h.includes(f))})}let y=w.custom({sync:()=>{let n=F(p.exteriorWalls(v()))||"None";h=n==="None"?[]:n.split(",").filter(Boolean),_()},commit:()=>ke(v(),"zone_exterior_walls",h.length?h.join(","):"None")});s.forEach(n=>{n.addEventListener("click",()=>{let f=n.dataset.wall,z=h.slice();if(f==="None")z=[];else{let C=z.indexOf(f);C>=0?z.splice(C,1):z.push(f)}h=["N","S","E","W"].filter(C=>z.includes(C)),_(),y.markDirty(),u.value=String(Br(h.length)),b.markDirty()})});function l(n){let f=v();(n===p.area(f)||n===p.spacing(f)||n===p.pipeType(f)||n===p.exteriorWalls(f)||n===p.windExposure(f)||n===p.solarGain(f)||n===p.thermalLeadH(f))&&w.refresh()}T("selectedZone",w.discard),T("zoneNames",w.refresh);for(let n=1;n<=6;n++)x(p.area(n),l),x(p.spacing(n),l),x(p.pipeType(n),l),x(p.exteriorWalls(n),l),x(p.windExposure(n),l),x(p.solarGain(n),l),x(p.thermalLeadH(n),l);w.refresh()}});var $r=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
}

.flow-svg {
  width: 100%;
  height: auto;
}

.flow-line {
  stroke-dasharray: 6;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -12; }
}

.return-line {
  stroke: #8a508f;
  stroke-width: 4;
}

.valve {
  transition: height 0.3s ease, y 0.3s ease, fill 0.3s ease;
}

.label {
  font-size: 10px;
  fill: #ccc;
}

.flow-temp,
.ret-temp {
  font-size: 10px;
  fill: #ccc;
}
`;k("flow-diagram",$r);var ne=6,Do=[60,126,192,258,324,390],ot=225,ze=36,Ne=160,et=90,Ae=ze+Ne,se=640,Wr=11,Ct=6,Lt=24,De=se+20,Fo=se+200,Mo=se+300,Ao=se+372,To="#6E7E96",Oo="#5C6B85",jr="#8a508f",Vr="#BC5090",Gr="#FF8531",Ur="#FFA600",Xr="#8a508f",Yr="#FFEAD2",Kr="#6E7E96",No="#C7B6CE",Et="#5C6B85",tt="#A38FB0",Jr="#9A86A8",Qr="#8a508f",ea="#66BB6A",ta="#FF6361";function rt(e,t,r){var o=ot+(e-2.5)*Wr,i=Do[e],d=se-Ae,s=Ae+d*.33,u=Ae+d*.67;return"M"+Ae+" "+(o-t).toFixed(1)+" C"+s+" "+(o-t).toFixed(1)+" "+u+" "+(i-r).toFixed(1)+" "+se+" "+(i-r).toFixed(1)+" L"+se+" "+(i+r).toFixed(1)+" C"+u+" "+(i+r).toFixed(1)+" "+s+" "+(o+t).toFixed(1)+" "+Ae+" "+(o+t).toFixed(1)+"Z"}function oa(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function ra(e){let t=String(le(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function aa(e,t){return t?e==null||Number.isNaN(e)?Oo:e<.15?jr:e<.4?Vr:e<.7?Gr:Ur:To}function na(){var e=1160,t=460,r=ot-et/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(122,167,206,0.2)"/><stop offset="48%" stop-color="rgba(240,121,91,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(var i=1;i<=ne;i++)o.push('<linearGradient id="rg'+i+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+i+'" offset="0%" stop-color="#ff8531"/>'),o.push('<stop id="rga'+i+'" offset="100%" stop-color="#8a508f"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#042a3b"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var d=1;d<=ne;d++){var s=rt(d-1,Ct,Lt);o.push('<path d="'+s+'" fill="#062a3a" opacity="0.9"/>')}for(d=1;d<=ne;d++){var u=rt(d-1,Ct,Lt);o.push('<path id="fd-path-'+d+'" d="'+u+'" fill="url(#rg'+d+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+se+'" y1="36" x2="'+se+'" y2="'+(t-36)+'" stroke="#ff8531" stroke-width="3" opacity="0.55"/>');var c=5,m=ze-c;for(o.push('<rect x="0" y="'+r+'" width="'+m+'" height="'+et+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+ze+'" y="'+r+'" width="'+Ne+'" height="'+et+'" rx="6" fill="#ff8531"/>'),o.push('<text x="'+(ze+Ne/2)+'" y="'+(ot-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#00202e" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(ze+Ne/2)+'" y="'+(ot+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#00202e" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(ze+Ne/2)+'" y="'+(r+et+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#8a508f" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+De+'" y="34" font-size="11" fill="'+tt+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+Fo+'" y="34" font-size="11" fill="'+tt+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+Mo+'" y="34" font-size="11" fill="'+tt+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+Ao+'" y="34" font-size="11" fill="'+tt+'" font-weight="700" letter-spacing="2">RET</text>'),d=1;d<=ne;d++){var v=Do[d-1];o.push('<text id="fd-zn'+d+'" x="'+De+'" y="'+(v+2)+'" font-size="14" fill="#FFEAD2" font-weight="700" letter-spacing="2">ZONE '+d+"</text>"),o.push('<text id="fd-zf'+d+'" x="'+De+'" y="'+(v+18)+'" font-size="11" fill="#B6A6C0" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zsp'+d+'" x="'+(De+82)+'" y="'+(v+18)+'" font-size="11" fill="'+Et+'" font-weight="600" font-family="var(--mono)"></text>'),o.push('<text id="fd-zt'+d+'" x="'+Fo+'" y="'+(v+10)+'" font-size="16" fill="#F6ECE0" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+d+'" x="'+Mo+'" y="'+(v+10)+'" font-size="16" fill="#C7B7D0" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+d+'" x="'+Ao+'" y="'+(v+10)+'" font-size="16" fill="#C7B7D0" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Jr+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#ff8531" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#0C3A52" font-weight="700" letter-spacing="6">UFH - '+ne+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var sa=()=>`<div class="flow-wrap">${na()}</div>`;L({tag:"flow-diagram",render:sa,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(ne+1)};for(let i=1;i<=ne;i++)r.zones[i]={textTemp:t.querySelector("#fd-zt"+i),textSetpoint:t.querySelector("#fd-zsp"+i),textFlow:t.querySelector("#fd-zv"+i),textRet:t.querySelector("#fd-zr"+i),label:t.querySelector("#fd-zn"+i),friendly:t.querySelector("#fd-zf"+i),path:t.querySelector("#fd-path-"+i)};function o(){let i=S(a.flow),d=S(a.ret),s=r.flowEl,u=r.retEl,c=r.dtEl;if(s.textContent=ee(i),u.textContent="RET "+ee(d),i!=null&&d!=null){let m=Number(i)-Number(d);c.textContent=m.toFixed(1)+"\xB0C",c.setAttribute("fill",m<3?Qr:m>8?ta:ea)}else c.textContent="---";for(let m=1;m<=ne;m++){let v=S(p.temp(m)),w=S(p.setpoint(m)),b=S(p.valve(m)),h=$(p.enabled(m)),_=String(F(p.tempSource(m))||"Local Probe"),y=oa(F(p.probe(m))||""),l=y?S(p.probeTemp(y)):null,n=r.zones[m],f=n.textTemp,z=n.textSetpoint,C=n.textFlow,q=n.textRet,P=n.label,A=n.friendly,E=n.path,H=b!=null?Math.max(0,Math.min(100,Number(b)))/100:0;P.textContent="ZONE "+m;let Z=ra(m);A.textContent=Z||"---",P.setAttribute("fill",h?Yr:Kr),A.setAttribute("fill",h?No:Et),z.setAttribute("fill",h?No:Et);let W=A.getComputedTextLength?A.getComputedTextLength():0;z.setAttribute("x",String(De+W+8));let G=ee(v),I=w!=null?ee(w):null;if(f.textContent=G,z.textContent=I?"("+I+")":"",C.textContent=Ve(b),C.setAttribute("fill",aa(H,h)),_!=="Local Probe"&&l!=null&&!Number.isNaN(Number(l))?(q.textContent=ee(l),q.setAttribute("fill",h?Xr:To)):(q.textContent="---",q.setAttribute("fill",Oo)),!h)E.setAttribute("d",rt(m-1,1,2)),E.setAttribute("fill","#062a3a"),E.setAttribute("opacity","0.4");else{let ue=Math.max(3,H*Lt),Te=Math.max(1.5,H*Ct);E.setAttribute("d",rt(m-1,Te,ue)),E.setAttribute("fill","url(#rg"+m+")"),E.setAttribute("opacity","1")}}}x(a.flow,o),x(a.ret,o),T("zoneNames",o);for(let i=1;i<=ne;i++)x(p.temp(i),o),x(p.setpoint(i),o),x(p.valve(i),o),x(p.enabled(i),o),x(p.probe(i),o),x(p.tempSource(i),o);for(let i=1;i<=8;i++)x(p.probeTemp(i),o);o()}});var ia=48,la=1e3,nt="var(--series-warm)",st="var(--series-cool)",it="var(--series-solar)",lt=1e3,Po=300,pe=46,ca=52,te=16,da=56,at=lt-pe-ca,ie=Po-te-da,de=te+ie,pa=()=>`
  <div class="chart-card forecast-preview">
    <div class="chart-head">
      <span class="chart-title">Weather Forecast</span>
      <span class="chart-sub"></span>
    </div>
    ${Xe([{color:nt,label:"Temp (\xB0C)"},{color:st,label:"Wind (m/s)"},{color:it,label:"Solar (W/m\xB2)"}])}
    <div class="fc-body"></div>
  </div>
`;function ua(e){if(!e)return"No data";if(e<16e8)return"Clock syncing\u2026";let t=new Date(e*1e3),r=t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),o=new Date;return"Updated "+(t.getFullYear()===o.getFullYear()&&t.getMonth()===o.getMonth()&&t.getDate()===o.getDate()?r:t.toLocaleDateString([],{month:"short",day:"numeric"})+" "+r)}function ma(e){let t=e.hours.slice(0,ia),r=t.length,o=t.map(n=>n[0]),i=t.map(n=>n[1]),d=t.map(n=>n[3]||0),s=co(o,0,10),u=Math.max(2,...i)*1.15,c=n=>pe+(r<=1?0:n/(r-1)*at),m=n=>te+(1-(n-s.min)/(s.max-s.min))*ie,v=n=>te+(1-n/u)*ie,w=n=>te+(1-Math.max(0,Math.min(1,n/la)))*ie,b=B("svg",{viewBox:`0 0 ${lt} ${Po}`,preserveAspectRatio:"xMidYMid meet"});for(let n=0;n<4;n++){let f=n/3,z=te+f*ie;b.appendChild(B("line",{x1:pe,y1:z,x2:pe+at,y2:z,class:"chart-grid"})),b.appendChild(B("text",{x:pe-7,y:z+4,"text-anchor":"end",class:"chart-tick"},(s.max-(s.max-s.min)*f).toFixed(0)+"\xB0")),b.appendChild(B("text",{x:pe+at+7,y:z+4,"text-anchor":"start",class:"chart-tick"},(u-u*f).toFixed(0)))}b.appendChild(B("line",{x1:pe,y1:de,x2:pe+at,y2:de,class:"chart-axis"})),b.appendChild(B("text",{x:12,y:te+ie/2,transform:`rotate(-90 12 ${(te+ie/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"\xB0C")),b.appendChild(B("text",{x:lt-12,y:te+ie/2,transform:`rotate(90 ${lt-12} ${(te+ie/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"m/s"));let h="";for(let n=0;n<r;n++)h+=(n?" L ":"M ")+c(n).toFixed(1)+" "+w(d[n]).toFixed(1);h&&(h+=` L ${c(r-1).toFixed(1)} ${de} L ${c(0).toFixed(1)} ${de} Z`,b.appendChild(B("path",{d:h,fill:"color-mix(in srgb, var(--series-solar) 18%, transparent)",stroke:"none"})));let _=e.base_epoch?Math.floor((Date.now()/1e3-e.base_epoch)/3600):-1,y=new Date(e.base_epoch*1e3).getDate(),l=-1;for(let n=0;n<r;n++){let f=new Date((e.base_epoch+n*3600)*1e3),z=n===_,C=f.getDate()!==y;C&&l<0&&f.getHours()===0&&(l=n);let q=c(n),P=de+13;b.appendChild(B("text",{x:q,y:P,"text-anchor":"end",transform:`rotate(-45 ${q.toFixed(1)} ${P})`,class:"chart-hour"+(z?" now":C?" day2":"")},String(f.getHours()).padStart(2,"0"))),z&&b.appendChild(B("line",{x1:q,y1:te,x2:q,y2:de,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}if(l>0){let n=c(l);b.appendChild(B("line",{x1:n,y1:te,x2:n,y2:de,stroke:"rgba(202,219,248,.26)","stroke-width":"1","stroke-dasharray":"4 4","vector-effect":"non-scaling-stroke"})),b.appendChild(B("text",{x:n+4,y:te+11,"text-anchor":"start",class:"chart-hour day2"},"+1d"))}return b.appendChild(B("path",{d:_e(i.map((n,f)=>({x:c(f),y:v(n)}))),fill:"none",stroke:st,"stroke-width":"2.2","stroke-linejoin":"round","stroke-linecap":"round"})),b.appendChild(B("path",{d:_e(o.map((n,f)=>({x:c(f),y:m(n)}))),fill:"none",stroke:nt,"stroke-width":"2.6","stroke-linejoin":"round","stroke-linecap":"round"})),b.appendChild(B("path",{d:_e(d.map((n,f)=>({x:c(f),y:w(n)}))),fill:"none",stroke:it,"stroke-width":"1.8","stroke-linejoin":"round","stroke-linecap":"round",opacity:".85"})),{svg:b,model:{count:r,plotTop:te,plotBottom:de,xAt:c,label:n=>String(new Date((e.base_epoch+n*3600)*1e3).getHours()).padStart(2,"0")+":00",dots:n=>[{y:m(o[n]),color:nt},{y:v(i[n]),color:st},{y:w(d[n]),color:it}],rows:n=>[{color:nt,label:"Temp",value:o[n].toFixed(1)+"\xB0"},{color:st,label:"Wind",value:i[n].toFixed(1)+" m/s"},{color:it,label:"Solar",value:Math.round(d[n])+" W/m\xB2"}]}}}var js=L({tag:"monitor-forecast-preview",render:pa,onMount(e,t){let r=t.querySelector(".chart-sub"),o=t.querySelector(".fc-body"),i=t.matches(".forecast-preview")?t:t.querySelector(".forecast-preview"),d=null;function s(){d&&(d(),d=null);let u=Ht(),c=u&&Array.isArray(u.hours)?u.hours:[];if(!(u?u.count||c.length:0)||!c.length||!u.base_epoch){r.textContent="No data",o.innerHTML='<div style="color:var(--text-secondary);font-size:.8rem;text-align:center;padding:34px">No forecast fetched yet. Enable Forecast Preload in Settings and check the location.</div>';return}r.textContent=ua(u.fetch_epoch),o.innerHTML="";let{svg:v,model:w}=ma(u);o.appendChild(v),d=Ue(v,i,w)}T("forecastHours",s),s()}});var fa={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#8a508f"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},ga=`
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
`;k("logs-view",ga);var ba=()=>`
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
`;function ha(e){let t=fa[e.level]||{label:"?",color:"var(--text-secondary)"},r=qo(e.tag||""),o=qo(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+r+'</span><span class="msg">'+o+"</span></div>"}function qo(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var Ys=L({tag:"logs-view",render:ba,onMount(e,t){let r=t.querySelector(".logs-stream"),o=t.querySelector(".pause-btn"),i=t.querySelector(".clear-btn"),d=!1;function s(){if(d)return;let u=qt();if(!u||!u.length){r.innerHTML='<div class="logs-empty">Waiting for device logs\u2026</div>';return}let c=r.scrollHeight-r.scrollTop-r.clientHeight<40;r.innerHTML=u.map(ha).join(""),c&&(r.scrollTop=r.scrollHeight)}o.addEventListener("click",()=>{d=!d,o.textContent=d?"Resume":"Pause",o.classList.toggle("on",d),d||s()}),i.addEventListener("click",()=>{Rt()}),T("deviceLog",s),s()}});var va=`
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
}`;k("diag-i2c",va);var xa=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,oi=L({tag:"diag-i2c",render:xa,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=O("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{jt()}),T("i2cResult",o),o()}});var ya=`
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
`;k("diag-activity",ya);var wa=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function _a(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var ii=L({tag:"diag-activity",render:wa,onMount(e,t){let r=t.querySelector(".diag-log");function o(){_a(r,Ot())}T("activityLog",o),o()}});var za=`
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
`;k("diag-manual-badge",za);var Sa=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,ui=L({tag:"diag-manual-badge",render:Sa,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let i=!!O("manualMode");r&&r.classList.toggle("on",i)}T("manualMode",o),o()}});var ka=`
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
`;k("diag-zone-motor",ka);var Ca=e=>{let t=e.zone||O("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl">Motor</span>
          <select class="sel motor-zone-select">${r}</select>
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
  `},xi=L({tag:"diag-zone-motor-card",render:Ca,onMount(e,t){let r=Number(e.zone||O("selectedZone")||1),o=!!O("manualMode"),i=t.querySelector(".manual-mode-toggle"),d=t.querySelector(".motor-gated"),s=t.querySelector(".motor-zone-select"),u=t.querySelector(".motor-target-input"),c=t.querySelector(".motor-open-btn"),m=t.querySelector(".motor-close-btn"),v=t.querySelector(".motor-stop-btn");function w(_){o=!!_,i&&(i.classList.toggle("on",o),i.setAttribute("aria-checked",o?"true":"false")),d&&d.classList.toggle("locked",!o),[s,u,c,m,v].forEach(y=>{y&&(y.disabled=!o)})}function b(){let _=!o;if(w(_),_){gt(!0);for(let y=1;y<=6;y++)ft(y)}else gt(!1)}function h(){let _=S(p.motorTarget(r));u&&_!=null?u.value=Number(_).toFixed(0):u&&(u.value="0")}s==null||s.addEventListener("change",()=>{r=Number(s.value||1),h()}),i==null||i.addEventListener("click",b),i==null||i.addEventListener("keydown",_=>{_.key!==" "&&_.key!=="Enter"||(_.preventDefault(),b())});for(let _=1;_<=6;_++)x(p.motorTarget(_),h);h(),w(o),T("manualMode",()=>{w(!!O("manualMode"))}),u==null||u.addEventListener("change",_=>{if(!o)return;let y=_.target.value;Ut(r,y)}),c==null||c.addEventListener("click",()=>{o&&Xt(r,1e4)}),m==null||m.addEventListener("click",()=>{o&&Yt(r,1e4)}),v==null||v.addEventListener("click",()=>{o&&ft(r)})}});var La=`
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
`;k("diag-zone-recovery",La);var Ea=()=>`
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
  `,ki=L({tag:"diag-zone-recovery-card",render:Ea,onMount(e,t){let r=Number(O("selectedZone")||1),o=t.querySelector(".recovery-fault-btn"),i=t.querySelector(".recovery-factors-btn"),d=t.querySelector(".recovery-relearn-btn"),s=t.querySelector(".recovery-status");T("selectedZone",()=>{r=Number(O("selectedZone")||1)});let u=null;function c(v,w){s.textContent=v,s.className="recovery-status show "+(w?"ok":"err"),clearTimeout(u),u=setTimeout(()=>{s.classList.remove("show")},4e3)}function m(v,w){let b=v(r);c(w,!0),b&&typeof b.then=="function"&&b.then(h=>{h&&h.ok===!1&&c("Failed \u2014 device rejected the request",!1)}).catch(()=>c("Failed \u2014 could not reach device",!1))}o==null||o.addEventListener("click",()=>{m(Kt,"\u2713 Fault reset sent for "+oe(r))}),i==null||i.addEventListener("click",()=>{confirm("Reset learned factors for "+oe(r)+"?")&&m(Jt,"\u2713 Learned factors reset for "+oe(r))}),d==null||d.addEventListener("click",()=>{confirm("Reset + relearn motor for "+oe(r)+"?")&&m(Qt,"\u2713 Relearn started for "+oe(r))})}});var Fa=`
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
`;k("diag-system-card",Fa);var Ma=()=>`
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
`,Ni=L({tag:"diag-system-card",render:Ma,onMount(e,t){let r=t.querySelector('[data-k="cpu0"]'),o=t.querySelector('[data-k="cpu1"]'),i=t.querySelector('[data-k="heap"]'),d=t.querySelector('[data-k="psram"]'),s=t.querySelector('[data-bar="cpu0"]'),u=t.querySelector('[data-bar="cpu1"]'),c=(w,b,h)=>{if(h==null||!Number.isFinite(Number(h))){w.textContent="\u2014",w.classList.remove("warn"),b.style.width="0%";return}let _=Math.max(0,Math.min(100,Number(h)));w.textContent=_.toFixed(0)+"%",w.classList.toggle("warn",_>=90),b.style.width=_+"%",b.style.backgroundPosition=_+"% 0"},m=(w,b,h)=>{if(b==null||!Number.isFinite(Number(b))){w.textContent="\u2014";return}let _=Number(b);w.textContent=_+" KB",w.classList.toggle("warn",h!=null&&_<h)},v=()=>{c(r,s,S(a.cpuLoadCore0)),c(o,u,S(a.cpuLoadCore1)),m(i,S(a.freeInternalKb),48),m(d,S(a.freePsramKb),null)};t.querySelector(".sys-dump").addEventListener("click",()=>{to().catch(w=>console.error("[System] dump failed:",w))}),x(a.cpuLoadCore0,v),x(a.cpuLoadCore1,v),x(a.freeInternalKb,v),x(a.freePsramKb,v),v()}});var Aa=`
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
`;k("settings-manifold-card",Aa);var Na=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text">Manifold Configuration${ae("Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow\u2013return delta.")}</span></div>
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
    </div>
  `},Ii=L({tag:"settings-manifold-card",render:Na,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),i=t.querySelector(".sm-ret"),d=Y(t);d.select(r,{read:()=>F(a.manifoldType)||"NO (Normally Open)",commit:u=>J("manifold_type",u)}),d.select(o,{read:()=>F(a.manifoldFlowProbe)||"Probe 7",commit:u=>J("manifold_flow_probe",u)}),d.select(i,{read:()=>F(a.manifoldReturnProbe)||"Probe 8",commit:u=>J("manifold_return_probe",u)});function s(){for(let u=1;u<=8;u++){let c=t.querySelector('[data-probe="'+u+'"]');c&&(c.textContent=ee(S(p.probeTemp(u))))}}x(a.manifoldType,d.refresh),x(a.manifoldFlowProbe,d.refresh),x(a.manifoldReturnProbe,d.refresh);for(let u=1;u<=8;u++)x(p.probeTemp(u),s);d.refresh(),s()}});var Da=`
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
`;k("settings-control-card",Da);var Ta=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,Vi=L({tag:"settings-control-card",render:Ta,onMount(e,t){t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{re("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{re("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{re("restart")})}});var Oa=`
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
`;k("settings-motor-calibration-card",Oa);var ct=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:a.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:a.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:a.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:a.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:a.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:a.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:a.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:a.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:a.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:a.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:a.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:a.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Pa=()=>{let e="";for(let t=0;t<ct.length;t++){let r=ct[t],o=qa(r.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label">'+r.label+" ("+r.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+r.cls+'" value="0" step="'+o+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text">Motor Calibration &amp; Learning${ae("Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.")}</span></div>
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
  `};function qa(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var el=L({tag:"settings-motor-calibration-card",render:Pa,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime"),i=t.querySelector(".mc-drivers-toggle"),d=Y(t);function s(c){if(c==="HmIP VdMot"&&Q("hmip_runtime_limit_seconds",40),c==="Generic"){let m=Number(S(a.genericRuntimeLimitSeconds));(!Number.isFinite(m)||m<=0)&&Q("generic_runtime_limit_seconds",45)}}d.toggle(i,{read:()=>$(a.drivers),commit:c=>We(c)}),d.select(r,{read:()=>F(a.motorProfileDefault)||"HmIP VdMot",commit:c=>{J("motor_profile_default",c),s(c)}});function u(){let c=F(a.motorProfileDefault)||"HmIP VdMot";o.disabled=c==="HmIP VdMot"}d.num(o,{read:()=>(F(a.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:S(a.genericRuntimeLimitSeconds),commit:c=>{r.value==="Generic"&&Q("generic_runtime_limit_seconds",c)}});for(let c=0;c<ct.length;c++){let m=ct[c];if(m.key==="generic_runtime_limit_seconds")continue;let v=t.querySelector(".smc-"+m.cls);v&&(d.num(v,{read:()=>S(m.id),commit:w=>Q(m.key,w)}),x(m.id,d.refresh))}x(a.drivers,d.refresh),x(a.motorProfileDefault,()=>{d.refresh(),u()}),x(a.genericRuntimeLimitSeconds,d.refresh),x(a.hmipRuntimeLimitSeconds,d.refresh),s(F(a.motorProfileDefault)||"HmIP VdMot"),d.refresh(),u()}});var Ra=`
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
`;k("settings-asgard-card",Ra);var Ha=()=>`
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text">Asgard / Ecodan Bridge${ae("Pushes the house-weighted room temperature to the Ecodan/Asgard virtual thermostat. One board is the coordinator and aggregates zones from both boards; the other is a slave.")}</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="ui-row">
      <span class="ui-label">Bridge enabled</span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" aria-label="Toggle Asgard bridge"></div></span>
    </div>

    <div class="ui-section">Minimum zone flow</div>
    <div class="ui-row">
      <span class="ui-label">Always enforce <span class="ui-sublabel">use when a modulating heat source is attached without enabling this bridge</span></span>
      <span class="ui-field"><div class="ui-toggle sa-minflow-always" role="switch" aria-label="Always enforce minimum zone flow"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Min valve opening (%) <span class="ui-sublabel">floor held on every enabled zone while the bridge or this option is active</span></span>
      <span class="ui-field"><input class="ui-input sa-minflow" type="number" min="0" max="50" step="1" placeholder="15" /></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label">Coordinator <span class="ui-sublabel">pushes to Asgard</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section">Asgard</div>
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
        <span class="ui-note">Fixed value to set as the virtual thermostat setpoint in Asgard \u2014 the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
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
`,ll=L({tag:"settings-asgard-card",render:Ha,onMount(e,t){let r=t.querySelector(".asgard-role-badge"),o=t.querySelector(".sa-enable"),i=t.querySelector(".sa-coord"),d=t.querySelector(".sa-host"),s=t.querySelector(".sa-port"),u=t.querySelector(".sa-entity"),c=t.querySelector(".sa-peer"),m=t.querySelector(".sa-interval"),v=t.querySelector(".sa-minflow-always"),w=t.querySelector(".sa-minflow"),b=t.querySelector(".sa-st-peer"),h=t.querySelector(".sa-st-push"),_=t.querySelector(".sa-st-setpoint"),y=t.querySelector(".sa-st-zones"),l=t.querySelector(".sa-st-err"),n=t.querySelector(".sa-body"),f=Y(t);function z(E,H,Z){return W=>{let G=W?"on":"off";g(E,{state:G}),J(H,G).catch(I=>{console.error(`[Asgard] Failed to update ${Z}:`,I),g(E,{state:W?"off":"on"})})}}let C=E=>n.classList.toggle("is-disabled",!E);f.toggle(o,{read:()=>$(a.asgardEnabled),commit:z(a.asgardEnabled,"asgard_enabled","enabled"),onChange:C}),f.toggle(i,{read:()=>$(a.asgardCoordinator),commit:z(a.asgardCoordinator,"asgard_coordinator","coordinator")}),f.toggle(v,{read:()=>$(a.minimumFlowAlways),commit:z(a.minimumFlowAlways,"minimum_flow_always","minimum flow")});function q(E,H){return Z=>{g(E,{state:Z}),Vt(H,Z).catch(W=>console.error(`[Asgard] Failed to update ${H}:`,W))}}f.text(d,{read:()=>F(a.asgardHost),commit:q(a.asgardHost,"asgard_host")}),f.text(u,{read:()=>F(a.asgardEntityName),commit:q(a.asgardEntityName,"asgard_entity_name")}),f.text(c,{read:()=>F(a.asgardPeerHost),commit:q(a.asgardPeerHost,"asgard_peer_host")});function P(E,H){return Z=>{g(E,{value:Z}),Q(H,Z).catch(W=>console.error(`[Asgard] Failed to update ${H}:`,W))}}f.num(s,{read:()=>S(a.asgardPort),commit:P(a.asgardPort,"asgard_port")}),f.num(m,{read:()=>S(a.asgardPushIntervalS),commit:P(a.asgardPushIntervalS,"asgard_push_interval_s")}),f.num(w,{read:()=>S(a.minZoneFlowPct),commit:P(a.minZoneFlowPct,"min_zone_flow_pct")});function A(){let E=F(a.asgardRole)||"slave";r.textContent=E,r.className="asgard-role-badge "+(E==="master"?"master":"slave");let H=F(a.asgardPeerStatus)||"n/a";b.textContent=H,b.classList.toggle("warn",H==="stale"||H==="unreachable");let Z=S(a.asgardLastPushC),W=S(a.asgardLastPushAgeS);if(Z!=null&&Number.isFinite(Z)&&W!=null){let Bo=W<120?`${Math.round(W)}s ago`:`${Math.round(W/60)}m ago`;h.textContent=`${Z.toFixed(2)}\xB0C (${Bo})`}else h.textContent="\u2014";let G=S(a.asgardSetpointC);_.textContent=G!=null&&Number.isFinite(G)?`${G.toFixed(1)}\xB0C`:"\u2014";let I=S(a.asgardLocalZones),ue=S(a.asgardPeerZones);y.textContent=I!=null?`${I} local + ${ue||0} peer`:"\u2014";let Te=F(a.asgardLastError);l.textContent=Te||"\u2014",l.classList.toggle("warn",!!Te)}x(a.asgardEnabled,f.refresh),x(a.minimumFlowAlways,f.refresh),x(a.asgardCoordinator,f.refresh),x(a.asgardRole,A),x(a.asgardPeerStatus,A),x(a.asgardLastPushC,A),x(a.asgardSetpointC,A),x(a.asgardLastPushAgeS,A),x(a.asgardLocalZones,A),x(a.asgardPeerZones,A),x(a.asgardLastError,A),x(a.asgardHost,f.refresh),x(a.asgardEntityName,f.refresh),x(a.asgardPeerHost,f.refresh),x(a.asgardPort,f.refresh),x(a.asgardPushIntervalS,f.refresh),x(a.minZoneFlowPct,f.refresh),f.refresh(),A()}});var Ro=[1,2,3,4,5,6],Ba=`
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
`;k("settings-forecast-card",Ba);var Ia=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,Za=()=>`
  <div class="ui-card settings-forecast-card">
    <div class="ui-card-title">
      <span class="ui-title-text">Forecast Preload${ae("Charges the slab before incoming weather: raises a zone setpoint when forecast wind on its exterior walls is about to spike. Solar gain offsets it. Fetched from Open-Meteo hourly.")}</span>
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
          ${Ro.map(Ia).join("")}
        </tbody>
      </table>
      <div class="ui-note fc-note">Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.</div>
    </div>
  </div>
`,bl=L({tag:"settings-forecast-card",render:Za,onMount(e,t){let r=t.querySelector(".fc-badge"),o=t.querySelector(".fc-enable"),i=t.querySelector(".fc-body"),d=t.querySelector(".fc-lat"),s=t.querySelector(".fc-lon"),u=t.querySelector(".fc-threshold"),c=t.querySelector(".fc-maxoffset"),m=t.querySelector(".fc-age"),v=t.querySelector(".fc-error"),w=t.querySelector(".fc-fetch-btn"),b=Y(t);function h(z){if(!z)return"";if(z<16e8)return"clock syncing\u2026";let C=new Date(z*1e3),q=C.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),P=new Date;return C.getFullYear()===P.getFullYear()&&C.getMonth()===P.getMonth()&&C.getDate()===P.getDate()?q:C.toLocaleDateString([],{month:"short",day:"numeric"})+" "+q}function _(){let z=h(S(a.forecastFetchEpoch));m.textContent=z?`Last fetch: ${z}`:"";let C=F(a.forecastLastError);v.textContent=C||""}w.addEventListener("click",()=>{w.disabled=!0,w.textContent="Fetching\u2026",re("trigger_forecast_fetch").catch(()=>{}),setTimeout(()=>{Ce()},15e3),setTimeout(()=>{w.disabled=!1,w.textContent="Fetch Now"},2e4)});let y=z=>{i&&i.classList.toggle("is-disabled",!z)};b.toggle(o,{read:()=>$(a.forecastEnabled),onChange:y,commit:z=>{let C=z?"on":"off";g(a.forecastEnabled,{state:C}),J("forecast_enabled",C).catch(q=>{console.error("[Forecast] toggle failed:",q),g(a.forecastEnabled,{state:z?"off":"on"})})}});function l(z,C){return q=>{g(z,{value:q}),Q(C,q).catch(P=>console.error(`[Forecast] ${C} failed:`,P))}}b.num(d,{nostep:!0,read:()=>S(a.forecastLatitude),commit:l(a.forecastLatitude,"forecast_latitude")}),b.num(s,{nostep:!0,read:()=>S(a.forecastLongitude),commit:l(a.forecastLongitude,"forecast_longitude")}),b.num(u,{read:()=>S(a.forecastLoadThreshold),commit:l(a.forecastLoadThreshold,"forecast_load_threshold")}),b.num(c,{read:()=>S(a.forecastMaxOffsetC),commit:l(a.forecastMaxOffsetC,"forecast_max_offset_c")});function n(){let z=F(a.forecastStatus)||"disabled";r.textContent=z,r.className="fc-badge",z==="ok"?r.classList.add("ok"):(z==="stale"||z.indexOf("external")>=0)&&r.classList.add("external")}function f(){t.querySelectorAll(".fc-zone-body tr").forEach(z=>{let C=parseInt(z.getAttribute("data-zone"),10),q=z.querySelector(".fc-offset"),P=S(p.forecastOffset(C)),A=S(p.forecastPeakH(C));P!=null&&P>.01?(q.textContent=`+${P.toFixed(1)}\xB0`+(A!=null&&A>=0?` (${A}h)`:""),q.classList.add("active")):(q.textContent="\u2014",q.classList.remove("active"))})}x(a.forecastStatus,n),x(a.forecastEnabled,()=>{b.refresh(),n()}),x(a.forecastLatitude,b.refresh),x(a.forecastLongitude,b.refresh),x(a.forecastLoadThreshold,b.refresh),x(a.forecastMaxOffsetC,b.refresh),x(a.forecastFetchEpoch,_),x(a.forecastLastError,_),Ro.forEach(z=>{x(p.forecastOffset(z),f)}),n(),_(),f(),b.refresh()}});var Ho=[1,2,3,4,5,6],$a=`
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
`;k("settings-balancing-card",$a);var Wa=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="bal-static">\u2014</td>
    <td class="bal-adapt">\u2014</td>
    <td class="bal-eff eff">\u2014</td>
    <td class="bal-err err">\u2014</td>
  </tr>
`,ja=()=>`
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span class="ui-title-text">Hydraulic Balancing${ae("Scales raw valve positions by pipe length and zone area so long loops get proportionally more flow. Adaptive mode tunes the factors over time.")}</span></div>

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
        ${Ho.map(Wa).join("")}
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
`,Sl=L({tag:"settings-balancing-card",render:ja,onMount(e,t){let r=t.querySelector(".bal-mode"),o=t.querySelector(".bal-adaptive-body"),i=t.querySelector(".bal-interval"),d=t.querySelector(".bal-step"),s=t.querySelector(".bal-min"),u=t.querySelector(".bal-max"),c=Y(t),m=h=>{o&&o.classList.toggle("is-disabled",h!=="Adaptive")};c.select(r,{read:()=>F(a.balanceMode)||"Static",commit:h=>J("balance_mode",h)}),r.addEventListener("change",()=>m(r.value));function v(h,_){return y=>{g(h,{value:y}),Q(_,y).catch(l=>console.error(`[Balancing] ${_} failed:`,l))}}c.num(i,{read:()=>S(a.adaptIntervalS),commit:v(a.adaptIntervalS,"adapt_interval_s")}),c.num(d,{read:()=>S(a.adaptStep),commit:v(a.adaptStep,"adapt_step")}),c.num(s,{read:()=>S(a.adaptMin),commit:v(a.adaptMin,"adapt_min")}),c.num(u,{read:()=>S(a.adaptMax),commit:v(a.adaptMax,"adapt_max")}),t.querySelector(".bal-reset").addEventListener("click",()=>{eo().catch(h=>console.error("[Balancing] reset failed:",h))});let w=(h,_=2)=>h!=null&&Number.isFinite(Number(h))?Number(h).toFixed(_):"\u2014";function b(){t.querySelectorAll(".bal-zone-body tr").forEach(h=>{let _=parseInt(h.getAttribute("data-zone"),10);h.querySelector(".bal-static").textContent=w(S(p.staticFactor(_))),h.querySelector(".bal-adapt").textContent=w(S(p.balanceAdapt(_))),h.querySelector(".bal-eff").textContent=w(S(p.balanceFactor(_)));let y=S(p.adaptErr(_)),l=h.querySelector(".bal-err");if(l.classList.remove("cold","warm"),y==null||!Number.isFinite(Number(y)))l.textContent="\u2014";else{l.textContent=(y>=0?"+":"")+Number(y).toFixed(2);let n=y>.05?"cold":y<-.05?"warm":"";n&&l.classList.add(n)}})}x(a.balanceMode,()=>{c.refresh(),m(F(a.balanceMode)||"Static")}),x(a.adaptIntervalS,c.refresh),x(a.adaptStep,c.refresh),x(a.adaptMin,c.refresh),x(a.adaptMax,c.refresh),Ho.forEach(h=>{x(p.staticFactor(h),b),x(p.balanceAdapt(h),b),x(p.balanceFactor(h),b),x(p.adaptErr(h),b)}),c.refresh(),m(F(a.balanceMode)||"Static"),b()}});var Va=`
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
`;k("smart-preheat-card",Va);var Ga=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text">Preheat${ae("When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing \u2014 absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.")}</span></div>
    <div class="ui-row">
      <span class="ui-label">Simple Preheat</span>
      <span class="ui-field"><div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div></span>
    </div>
    <div class="ui-note">Learns a per-zone head-start so a room reaches its setpoint on time despite slab lag.</div>

    <div class="ui-divider"></div>
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
`,Nl=L({tag:"smart-preheat-card",render:Ga,onMount(e,t){let r=t.querySelector(".preheat-toggle"),o=t.querySelector(".absorb-toggle"),i=t.querySelector(".absorb-badge"),d=t.querySelector(".absorb-band"),s=t.querySelector(".absorb-delta"),u=t.querySelector(".absorb-body");function c(){let b=String(F(a.simplePreheatEnabled)||"").toLowerCase();return b==="on"||b==="true"||b==="1"||b==="enabled"}let m=Y(t);m.toggle(r,{read:c,commit:b=>J("simple_preheat_enabled",b?"on":"off")});let v=b=>{u&&u.classList.toggle("is-disabled",!b)};m.toggle(o,{read:()=>$(a.preheatAbsorbEnabled),onChange:v,commit:b=>{let h=b?"on":"off";g(a.preheatAbsorbEnabled,{state:h}),J("preheat_absorb_enabled",h)}}),m.num(d,{read:()=>S(a.preheatAbsorbBandC),commit:b=>{g(a.preheatAbsorbBandC,{value:b}),Q("preheat_absorb_band_c",b)}}),m.num(s,{read:()=>S(a.preheatDetectDeltaC),commit:b=>{g(a.preheatDetectDeltaC,{value:b}),Q("preheat_detect_delta_c",b)}});function w(){let b=String(F(a.preheatAbsorbing)||"").toLowerCase()==="active";i.textContent=b?"active":"idle",i.classList.toggle("active",b)}x(a.simplePreheatEnabled,m.refresh),x(a.preheatAbsorbEnabled,m.refresh),x(a.preheatAbsorbing,w),x(a.preheatAbsorbBandC,m.refresh),x(a.preheatDetectDeltaC,m.refresh),m.refresh(),w()}});var Ua=`
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
`;k("settings-smart-heating",Ua);var Xa=()=>`
  <div class="settings-smart-heating">
    <div class="sh-section sh-preheat-slot"></div>
    <div class="sh-section sh-forecast-slot"></div>
  </div>
`,Pl=L({tag:"settings-smart-heating-card",render:Xa,onMount(e,t){t.querySelector(".sh-preheat-slot").appendChild(R("smart-preheat-card")),t.querySelector(".sh-forecast-slot").appendChild(R("settings-forecast-card"))}});var Ya=`
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
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return,
.overview-demand {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > *,
.overview-demand > * {
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
`;k("app-root",Ya);var Ka=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
          <div class="overview-flow-return"></div>
          <div class="overview-demand"></div>
        </div>
        <div class="overview-forecast" style="margin-top:14px"></div>
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
`;L({tag:"app-root",render:Ka,onMount(e,t){t.querySelector(".hdr").appendChild(R("hv6-header")),t.querySelector(".overview-flow").appendChild(R("flow-diagram")),t.querySelector(".overview-timeline").appendChild(R("zone-state-timeline")),t.querySelector(".overview-flow-return").appendChild(R("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(R("graph-widgets",{variant:"demand"})),t.querySelector(".overview-forecast").appendChild(R("monitor-forecast-preview")),t.querySelector(".zone-selector").appendChild(R("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(R("zone-detail",{zone:O("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(R("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(R("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(R("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(R("settings-manifold-card")),t.querySelector(".settings-asgard-slot").appendChild(R("settings-asgard-card")),t.querySelector(".settings-motor-cal-slot").appendChild(R("settings-motor-calibration-card")),t.querySelector(".settings-smart-heating-slot").appendChild(R("settings-smart-heating-card")),t.querySelector(".settings-balancing-slot").appendChild(R("settings-balancing-card"));let r=t.querySelector(".logs-main-col");r.appendChild(R("logs-view")),r.appendChild(R("diag-activity"));let o=t.querySelector(".logs-side-col");o.appendChild(R("connectivity-card")),o.appendChild(R("diag-system-card")),o.appendChild(R("diag-zone-motor-card",{zone:O("selectedZone")||1})),o.appendChild(R("settings-control-card")),o.appendChild(R("diag-manual-badge")),o.appendChild(R("diag-i2c"));let i=t.querySelectorAll(".sec");function d(){let s=O("section");i.forEach(u=>{u.classList.toggle("active",u.getAttribute("data-section")===s)})}T("section",d),d()}});function Ja(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(R("app-root")),xt()}Ja();})();
