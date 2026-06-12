(()=>{var ot={},Ce={};function z(e){return ot[e.tag]=e,e}function T(e,t){let r=ot[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let i=r.state(t||{});for(let d in i)o[d]=i[d]}if(r.methods)for(let i in r.methods)o[i]=r.methods[i];let s=document.createElement("div");s.innerHTML=r.render(o);let a=s.firstElementChild;return r.onMount&&r.onMount(o,a),a}function g(e,t){(Ce[e]||(Ce[e]=[])).push(t)}function G(e){let t=Ce[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var Q=6,Wt=28,Ae=Object.create(null),jt=Vt(),N={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:$t(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:jt,manualMode:!1,zoneStateHistory:null};function $t(){let e=Object.create(null);for(let t=1;t<=Q;t++)e[t]=[];return e}function Vt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<Q;)e.push("");return e.slice(0,Q)}function Gt(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(N.zoneNames))}catch(e){}}function U(e){return"$dashboard:"+e}function Fe(e){return Math.max(1,Math.min(Q,Number(e)||1))}function rt(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function y(e){let t=Ae[e];return t?t.v!=null?t.v:t.value!=null?t.value:rt(t.s!=null?t.s:t.state):null}function w(e){let t=Ae[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Ut(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function P(e){return Ut(w(e))}function p(e,t){let r=Ae[e];r||(r=Ae[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);G(e),e==="text_sensor-firmware_version"&&ie("firmwareVersion",w(e)||"")}function L(e,t){g(U(e),t)}function E(e){return N[e]}function ie(e,t){N[e]=t,G(U(e))}function at(e){N.section!==e&&(N.section=e,G(U("section")))}function nt(e){let t=Fe(e);N.selectedZone!==t&&(N.selectedZone=t,G(U("selectedZone")))}function le(e){let t=!!e;N.live!==t&&(N.live=t,G(U("live")))}function st(){N.pendingWrites+=1,G(U("pendingWrites"))}function Be(){N.pendingWrites=Math.max(0,N.pendingWrites-1),N.lastWriteAt=Date.now(),G(U("pendingWrites"))}function it(){return N.pendingWrites>0?!0:Date.now()-N.lastWriteAt<2e3}function lt(e,t){let r=Fe(e)-1;N.zoneNames[r]=String(t||"").trim(),Gt(),G(U("zoneNames"))}function re(e){return N.zoneNames[Fe(e)-1]||""}function de(e){let t=Fe(e),r=re(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function ce(e){N.i2cResult=e||"No scan has been run yet.",G(U("i2cResult"))}function A(e,t){let r={time:Xt(),msg:String(e||"")};for(N.activityLog.push(r);N.activityLog.length>60;)N.activityLog.shift();if(t>=1&&t<=Q){let o=N.zoneLog[t];for(o.push(r);o.length>8;)o.shift();G(U("zoneLog:"+t))}G(U("activityLog"))}function dt(e){return e>=1&&e<=Q?N.zoneLog[e]:N.activityLog}function Ze(e,t){let r=N[e];if(!Array.isArray(r))return;let o=rt(t);if(o!=null){for(r.push(o);r.length>Wt;)r.shift();G(U(e))}}function fe(e){let t=Date.now();if(!e&&t-N.lastHistoryAt<3200)return;N.lastHistoryAt=t;let r=0,o=0;for(let s=1;s<=Q;s++){let a=y("sensor-zone_"+s+"_valve_pct");a!=null&&(r+=a,o+=1)}Ze("historyFlow",y("sensor-manifold_flow_temperature")),Ze("historyReturn",y("sensor-manifold_return_temperature")),Ze("historyDemand",o?r/o:0)}function Xt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Le(e){N.zoneStateHistory=e||null,G(U("zoneStateHistory"))}var l={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},n={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",heliosEnabled:"switch-helios_enabled",heliosHost:"text-helios_host",heliosPort:"number-helios_port",heliosControllerId:"text-helios_controller_id",heliosPollIntervalS:"number-helios_poll_interval_s",heliosStaleAfterS:"number-helios_stale_after_s",heliosStatus:"helios_status",heliosDeviceId:"text-helios_device_id",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones"};var H=6,Yt=8,ct=null,ve=0,k={temp:new Float32Array(H),setpoint:new Float32Array(H),valve:new Float32Array(H),enabled:new Uint8Array(H),driversEnabled:1,fault:0,manualMode:0};function Jt(){k.manualMode=0,ie("manualMode",!1);for(let a=0;a<H;a++){k.temp[a]=20.5+a*.4,k.setpoint[a]=21+a%3*.5,k.valve[a]=12+a*8,k.enabled[a]=a===4?0:1;let i=a+1;p(l.temp(i),{value:k.temp[a]}),p(l.setpoint(i),{value:k.setpoint[a]}),p(l.valve(i),{value:k.valve[a]}),p(l.state(i),{state:k.valve[a]>5?"heating":"idle"}),p(l.enabled(i),{value:!!k.enabled[a],state:k.enabled[a]?"on":"off"}),p(l.probe(i),{state:"Probe "+i}),p(l.tempSource(i),{state:i%2?"Local Probe":"BLE"}),p(l.syncTo(i),{state:"None"}),p(l.pipeType(i),{state:"PEX 16mm"}),p(l.area(i),{value:8+i*3.5}),p(l.spacing(i),{value:[150,200,150,100,200,150][a]}),p(l.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),p(l.exteriorWalls(i),{state:["N","E","S","W","N,E","S,W"][a]}),p(l.preheatAdvance(i),{value:.08+a*.03})}for(let a=1;a<=Yt;a++){let i=a<=H?a:H,d=k.temp[i-1]+(a>H?1:.1*a);p(l.probeTemp(a),{value:d})}p(n.flow,{value:34.1}),p(n.ret,{value:30.4}),p(n.uptime,{value:18*3600+720}),p(n.wifi,{value:-57}),p(n.drivers,{value:!0,state:"on"}),p(n.fault,{value:!1,state:"off"}),p(n.ip,{state:"192.168.1.86"}),p(n.ssid,{state:"MockLab"}),p(n.mac,{state:"D8:3B:DA:12:34:56"}),p(n.firmware,{state:"0.5.x-mock"}),p(n.manifoldFlowProbe,{state:"Probe 7"}),p(n.manifoldReturnProbe,{state:"Probe 8"}),p(n.manifoldType,{state:"NC (Normally Closed)"}),p(n.motorProfileDefault,{state:"HmIP VdMot"}),p(n.closeThresholdMultiplier,{value:1.7}),p(n.closeSlopeThreshold,{value:1}),p(n.closeSlopeCurrentFactor,{value:1.4}),p(n.openThresholdMultiplier,{value:1.7}),p(n.openSlopeThreshold,{value:.8}),p(n.openSlopeCurrentFactor,{value:1.3}),p(n.openRippleLimitFactor,{value:1}),p(n.genericRuntimeLimitSeconds,{value:45}),p(n.hmipRuntimeLimitSeconds,{value:40}),p(n.relearnAfterMovements,{value:2e3}),p(n.relearnAfterHours,{value:168}),p(n.learnedFactorMinSamples,{value:3}),p(n.learnedFactorMaxDeviationPct,{value:12}),p(n.simplePreheatEnabled,{state:"on"}),fe(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],s=[];for(let a=0;a<r;a++){let i=(r-1-a)*e,d=t-i,c=Math.floor(a/12)%24,u=o.map(f=>f[c%f.length]);s.push([d,...u])}Le({interval_s:e,uptime_s:t,count:r,entries:s})}function Qt(){ve+=1,p(n.uptime,{value:Number(Date.now()/1e3)|0}),p(n.wifi,{value:-55-Math.round((1+Math.sin(ve/4))*6)});let e=0,t=0,r=0;for(let i=0;i<H;i++){let d=i+1,c=!!k.enabled[i],u=k.temp[i],f=k.setpoint[i],h=c&&k.driversEnabled&&!k.manualMode&&u<f-.25;k.manualMode?k.valve[i]=Math.max(0,k.valve[i]):!c||!k.driversEnabled?k.valve[i]=Math.max(0,k.valve[i]-6):h?k.valve[i]=Math.min(100,k.valve[i]+7+d%3):k.valve[i]=Math.max(0,k.valve[i]-5);let _=h?.05+k.valve[i]/2200:-.03+k.valve[i]/3200;k.temp[i]=u+_+Math.sin((ve+d)/5)*.04,c&&k.valve[i]>0&&(e+=k.valve[i],t+=1,r=Math.max(r,k.valve[i])),p(l.temp(d),{value:k.temp[i]}),p(l.valve(d),{value:Math.round(k.valve[i])});let v=Math.max(0,(k.setpoint[i]-k.temp[i]-.15)*.22);p(l.preheatAdvance(d),{value:Number(v.toFixed(2))}),p(l.state(d),{state:c?h?"heating":"idle":"off"}),p(l.enabled(d),{value:c,state:c?"on":"off"}),p(l.probeTemp(d),{value:k.temp[i]+Math.sin((ve+d)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(ve/6)*.25,s=o-(t?2.1+e/Math.max(1,t*50):1.1);p(n.flow,{value:Number(o.toFixed(1))}),p(n.ret,{value:Number(s.toFixed(1))}),p(l.probeTemp(7),{value:Number((s-.4).toFixed(1))}),p(l.probeTemp(8),{value:Number((o+.2).toFixed(1))}),fe(!0);let a=E("zoneStateHistory");a&&(a.uptime_s=Number(Date.now()/1e3)|0)}function pt(){ct||(Jt(),le(!0),ct=setInterval(Qt,1200))}function Me(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=H){let a=Number(r);Number.isNaN(a)||(k.setpoint[o-1]=a,p(l.setpoint(o),{value:a}),A("Zone "+o+" setpoint set to "+a.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=H){let a=r>.5;k.enabled[o-1]=a?1:0,p(l.enabled(o),{value:a,state:a?"on":"off"}),A("Zone "+o+(a?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let a=r>.5;k.driversEnabled=a?1:0,p(n.drivers,{value:a,state:a?"on":"off"}),A(a?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let a=r>.5;k.manualMode=a?1:0,ie("manualMode",a);return}if(t==="motor_target"&&o>=1&&o<=H){let a=Number(r||0);p(l.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(a)))}),A("Motor "+o+" target set to "+a+"%",o);return}if(t==="command"){let a=String(r);if(a==="i2c_scan"){ce(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),A("I2C scan complete");return}if(a==="calibrate_all_motors"||a==="restart"){A("Command executed: "+a);return}if(a==="open_motor_timed"&&o>=1&&o<=H){A("Motor "+o+" open timed",o);return}if(a==="close_motor_timed"&&o>=1&&o<=H){A("Motor "+o+" close timed",o);return}if(a==="stop_motor"&&o>=1&&o<=H){A("Motor "+o+" stopped",o);return}if(a==="motor_reset_fault"&&o>=1&&o<=H){A("Motor "+o+" fault reset",o);return}if(a==="motor_reset_learned_factors"&&o>=1&&o<=H){A("Motor "+o+" learned factors reset",o);return}if(a==="motor_reset_and_relearn"&&o>=1&&o<=H){A("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){p(l.probe(o),{state:String(r)}),A("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){p(l.tempSource(o),{state:String(r)}),A("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){p(l.syncTo(o),{state:String(r)}),A("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){p(l.pipeType(o),{state:String(r)}),A("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){p(n.manifoldType,{state:String(r)}),A("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){p(n.manifoldFlowProbe,{state:String(r)}),A("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){p(n.manifoldReturnProbe,{state:String(r)}),A("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){p(n.motorProfileDefault,{state:String(r)}),A("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){p(n.simplePreheatEnabled,{state:String(r)}),A("Setting updated: "+t+" = "+r);return}if(t==="zone_ble_mac"&&o>=1){p(l.ble(o),{state:String(r)}),A("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){p(l.exteriorWalls(o),{state:String(r)||"None"}),A("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){p(l.area(o),{value:Number(r)}),A("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){p(l.spacing(o),{value:Number(r)}),A("Setting updated: "+t+" = "+r,o);return}let s={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct};if(s[t]){let a=Number(r);Number.isNaN(a)||(p(s[t],{value:a}),A("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){Me({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!k.enabled[e-1];Me({key:"zone_enabled",value:t?1:0,zone:e})}};var gt="/api/hv6/v1";function ut(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function j(e,t,r){if(st(),ut())try{return Me(r),Promise.resolve({ok:!0})}finally{Be()}let o=new URLSearchParams;for(let[i,d]of Object.entries(t||{}))d!=null&&o.append(i,d);let s=o.toString(),a=gt+e+(s?"?"+s:"");return fetch(a,{method:"POST"}).then(i=>(i.ok||console.warn(`API call failed: POST ${e} status=${i.status}`),i)).catch(i=>{throw console.error(`API call error: POST ${e}:`,i),i}).finally(()=>{Be()})}function We(e,t){return p(l.setpoint(e),{value:t}),j(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function mt(e,t){return p(l.enabled(e),{state:t?"on":"off",value:t}),j(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function Ne(e){return p(n.drivers,{state:e?"on":"off",value:e}),j("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function ae(e,t){return j("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function bt(){return ce("Scanning I2C bus..."),A("I2C scan started"),ae("i2c_scan")}var Kt={zone_probe:e=>l.probe(e),zone_temp_source:e=>l.tempSource(e),zone_sync_to:e=>l.syncTo(e),zone_pipe_type:e=>l.pipeType(e)},eo={zone_ble_mac:e=>l.ble(e),zone_exterior_walls:e=>l.exteriorWalls(e)},to={zone_area_m2:e=>l.area(e),zone_pipe_spacing_mm:e=>l.spacing(e)},oo={manifold_type:n.manifoldType,manifold_flow_probe:n.manifoldFlowProbe,manifold_return_probe:n.manifoldReturnProbe,motor_profile_default:n.motorProfileDefault,simple_preheat_enabled:n.simplePreheatEnabled,helios_enabled:n.heliosEnabled},ro={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct,helios_port:n.heliosPort,helios_poll_interval_s:n.heliosPollIntervalS,helios_stale_after_s:n.heliosStaleAfterS};function pe(e,t,r){let o=Kt[t];return o&&p(o(e),{state:r}),j("/settings/select",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function xe(e,t,r){let o=eo[t];return o&&p(o(e),{state:r}),j("/settings/text",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function je(e,t,r){let o=Number(r),s=to[t];return s&&!Number.isNaN(o)&&p(s(e),{value:o}),j("/settings/number",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function X(e,t){let r=oo[e];return r&&p(r,{state:t}),j("/settings/select",{key:e,value:t},{key:e,value:t})}function $(e,t){let r=Number(t),o=ro[e];return o&&!Number.isNaN(r)&&p(o,{value:r}),j("/settings/number",{key:e,value:r},{key:e,value:r})}function he(e,t){return j("/settings/text",{key:e,value:t},{key:e,value:t})}function ft(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return p(l.motorTarget(e),{value:o}),A("Motor "+e+" target set to "+o+"%",e),j(`/motors/${e}/target`,{value:o},{key:"motor_target",value:o,zone:e})}function vt(e,t=1e4){return A("Motor "+e+" open for "+t+"ms",e),j(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function xt(e,t=1e4){return A("Motor "+e+" close for "+t+"ms",e),j(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function $e(e){return A("Motor "+e+" stopped",e),j(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function Ve(e){return ie("manualMode",!!e),A(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),j("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function ht(e){return A("Motor "+e+" fault reset",e),ae("motor_reset_fault",e)}function yt(e){return A("Motor "+e+" learned factors reset",e),ae("motor_reset_learned_factors",e)}function wt(e){return A("Motor "+e+" reset and relearn started",e),ae("motor_reset_and_relearn",e)}function Ge(){ut()||fetch(gt+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Le(e)}).catch(()=>{})}var Ue=null,De=null,_t=null;async function ao(){De&&De.abort(),De=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:De.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function zt(e){if(!(!e||typeof e!="object")&&!it()){for(let t in e)p(t,e[t]);fe(!1)}}function no(e){if(e){if(!e.type){zt(e);return}if(e.type==="state"){zt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;A(t),String(t).indexOf("I2C_SCAN:")!==-1&&ce(String(t))}}}function St(){Ue||(Ue=setTimeout(()=>{Ue=null,Xe()},1e3))}function Xe(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){pt();return}ao().then(t=>{le(!0),no(t),Ge(),_t||(_t=setInterval(Ge,300*1e3)),St()}).catch(()=>{le(!1),St()})}var kt=Object.create(null);function S(e,t){if(kt[e])return;kt[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function I(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function ge(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Te(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function Et(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var so=`
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
  align-items: flex-start;
  justify-content: center;
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

.mode-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  color: var(--accent);
  font-size: .66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
}

.top-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
}

.menu-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid var(--control-border);
  background: linear-gradient(180deg, rgba(28,54,95,.54), rgba(19,38,70,.46));
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
  background: linear-gradient(180deg, rgba(42,76,132,.64), rgba(28,54,100,.54));
  border-color: rgba(120,168,255,.52);
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
  border: 1px solid rgba(120,168,255,.32);
  background: linear-gradient(180deg, rgba(31,61,105,.52), rgba(18,36,68,.42));
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
  border-color: rgba(238,161,17,.35);
  background: linear-gradient(180deg, rgba(83,56,20,.46), rgba(58,37,12,.36));
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: rgba(120,168,255,.24);
  background: linear-gradient(180deg, rgba(31,61,105,.34), rgba(18,36,68,.28));
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
  background: var(--blue);
  box-shadow: 0 0 12px rgba(83,168,255,.55);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  .top-brand { justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .top-meta { justify-items: center; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;S("hv6-header",so);var io=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">HeatValve-6</div>
          <div class="mode-pill" id="hdr-mode"></div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview">Dashboard</a>
        <a href="#" class="menu-link" data-section="zones">Zones</a>
        <a href="#" class="menu-link" data-section="diagnostics">Diagnostics</a>
        <a href="#" class="menu-link" data-section="settings">Settings</a>
      </nav>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,sa=z({tag:"hv6-header",render:io,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),s=t.querySelector("#hdr-sync"),a=t.querySelector("#hdr-up"),i=t.querySelector("#hdr-wifi"),d=t.querySelector("#hdr-fw"),c=t.querySelectorAll(".menu-link");function u(){let h=E("section");c.forEach(_=>{_.classList.toggle("active",_.getAttribute("data-section")===h)})}function f(){let h=E("live"),_=E("pendingWrites"),v=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":h?"Live":"Offline";r.textContent=v,o.classList.toggle("on",!!h),s.textContent=_>0?"Saving...":h?"Synced":"Offline";let m=_>0?"saving":h?"synced":"offline";s.className="meta-chip meta-chip-state "+m,a.textContent=Te(y(n.uptime)),i.textContent=Et(y(n.wifi));let x=E("firmwareVersion")||w(n.firmware);d.textContent=x?"FW "+x:""}c.forEach(h=>{h.addEventListener("click",_=>{_.preventDefault(),at(h.getAttribute("data-section"))})}),L("section",u),L("live",f),L("pendingWrites",f),L("firmwareVersion",f),g(n.uptime,f),g(n.wifi,f),g(n.firmware,f),u(),f()}});var lo=`
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
  background: #dbe8ff;
  border-radius: 999px;
  transition: .2s ease;
}
.status-card .sw.on {
  background: var(--blue);
  border-color: rgba(83,168,255,.4);
}
.status-card .sw.on::after {
  transform: translateX(16px);
  background: #0f213c;
}
.status-card .sw.off {
  background: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}
.status-card .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(120,168,255,.35);
  transition: .2s ease;
  flex-shrink: 0;
  display: inline-block;
}
.status-card .dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(83,168,255,.55);
}
`;S("status-card",lo);var co=e=>`
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
`,ua=z({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:co,methods:{update(e){this.motorDriversOn=P(n.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=P(n.fault)?"FAULT":"OK",this.connOn=E("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);g(n.drivers,o),g(n.fault,o),L("live",o),r.sw.onclick=()=>{Ne(!e.motorDriversOn)},o()}});var po=`
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
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
.connectivity-card .st td { padding: 10px 0; font-size: .88rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 48%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;S("connectivity-card",po);var go=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,ya=z({tag:"connectivity-card",render:go,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),s=t.querySelector(".cc-mac"),a=t.querySelector(".cc-up");function i(){r.textContent=w(n.ip)||"---",o.textContent=w(n.ssid)||"---",s.textContent=w(n.mac)||"---",a.textContent=Te(y(n.uptime))}g(n.ip,i),g(n.ssid,i),g(n.mac,i),g(n.uptime,i),i()}});var Ye="http://www.w3.org/2000/svg",Ft=220,Je=132,ee=10,uo=10,mo=24,J=34,ye=Ft-J-uo,se=Je-ee-mo,bo=360,fo=`
.graph-widgets {
  display: grid;
  gap: 12px;
}

.graph-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg);
  padding: 10px 12px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.graph-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .75px;
  font-weight: 700;
}

.graph-head strong {
  color: var(--text-strong);
  font-size: .82rem;
}

.graph-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
}

.graph-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-faint);
  font-size: .62rem;
  letter-spacing: .5px;
  text-transform: uppercase;
  font-weight: 700;
}

.graph-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(10, 20, 34, .45);
}

.graph-card svg {
  width: 100%;
  height: 132px;
  flex: 1;
  min-height: 132px;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(83,168,255,.12), rgba(15,33,60,.4));
}

.graph-axis,
.graph-grid {
  vector-effect: non-scaling-stroke;
}

.graph-tick-label {
  fill: var(--text-faint);
  font-size: 8px;
  letter-spacing: .4px;
}

.graph-axis-label {
  fill: var(--text-faint);
  font-size: 6px;
  letter-spacing: .8px;
  text-transform: uppercase;
  opacity: .7;
}
`;S("graph-widgets",fo);var vo=e=>e.variant==="flow-return"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>':e.variant==="demand"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>':'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';function Ct(e,t,r){if(!e.length)return"";let o=Math.max(.001,r-t),s=e.length>1?ye/(e.length-1):0,a="";for(let i=0;i<e.length;i++){let d=J+s*i,c=ee+(1-(e[i]-t)/o)*se;a+=(i?" L ":"M ")+d.toFixed(2)+" "+c.toFixed(2)}return a}function ue(e,t,r){let o=document.createElementNS(Ye,e);return t&&Object.keys(t).forEach(s=>{o.setAttribute(s,t[s])}),r!=null&&(o.textContent=r),o}function xo(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"C":"---"}function ho(e){return e<=0?"now":e>=60?"-"+Math.round(e/60)+"h":"-"+Math.round(e)+"m"}function yo(e,t,r,o){let s="rgba(143, 176, 230, 0.42)",a="rgba(143, 176, 230, 0.16)",d=[{x:J,ratio:0},{x:J+ye/2,ratio:.5},{x:J+ye,ratio:1}];e.appendChild(ue("line",{x1:J,y1:ee,x2:J,y2:ee+se,stroke:s,"stroke-width":"1",class:"graph-axis"})),e.appendChild(ue("line",{x1:J,y1:ee+se,x2:J+ye,y2:ee+se,stroke:s,"stroke-width":"1",class:"graph-axis"}));for(let c=0;c<3;c++){let u=c/2,f=ee+u*se,h=r-(r-t)*u;e.appendChild(ue("line",{x1:J,y1:f,x2:J+ye,y2:f,stroke:a,"stroke-width":"1",class:"graph-grid"})),e.appendChild(ue("text",{x:J-5,y:f+3,"text-anchor":"end",class:"graph-tick-label"},xo(h,o)))}d.forEach(c=>{let u=bo*(1-c.ratio);e.appendChild(ue("text",{x:c.x,y:Je-6,"text-anchor":c.ratio===0?"start":c.ratio===1?"end":"middle",class:"graph-tick-label"},ho(u)))}),e.appendChild(ue("text",{x:5,y:ee+se/2,transform:"rotate(-90 5 "+(ee+se/2).toFixed(2)+")","text-anchor":"middle",class:"graph-axis-label"},o==="%"?"Demand":"Temp"))}function wo(e,t,r){let o=e.concat(t||[]).filter(d=>Number.isFinite(d));if(!o.length)return r==="%"?{min:0,max:100}:{min:0,max:10};let s=Math.min.apply(null,o),a=Math.max.apply(null,o);if(r==="%"&&(s=Math.max(0,s),a=Math.min(100,a)),s===a){let d=r==="%"?5:.5;s-=d,a+=d}let i=(a-s)*.08;return s-=i,a+=i,r==="%"&&(s=Math.max(0,s),a=Math.min(100,a)),{min:s,max:a}}function At(e,t,r,o,s,a){e.innerHTML="",e.setAttribute("viewBox","0 0 "+Ft+" "+Je),e.setAttribute("preserveAspectRatio","none");let i=wo(t,o,a);yo(e,i.min,i.max,a);let d=Ct(t,i.min,i.max);if(d){let u=document.createElementNS(Ye,"path");u.setAttribute("d",d),u.setAttribute("fill","none"),u.setAttribute("stroke",r),u.setAttribute("stroke-width","2.2"),u.setAttribute("stroke-linecap","round"),u.setAttribute("stroke-linejoin","round"),e.appendChild(u)}let c=o&&o.length?Ct(o,i.min,i.max):"";if(c){let u=document.createElementNS(Ye,"path");u.setAttribute("d",c),u.setAttribute("fill","none"),u.setAttribute("stroke",s),u.setAttribute("stroke-width","2"),u.setAttribute("stroke-linecap","round"),u.setAttribute("stroke-linejoin","round"),e.appendChild(u)}}var _o="var(--accent)",zo="var(--blue)",So="var(--blue)",ka=z({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:vo,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),s=t.querySelector(".gw-flow"),a=t.querySelector(".gw-demand");function i(){let d=E("historyFlow"),c=E("historyReturn"),u=E("historyDemand"),f=d.length?d[d.length-1]:null,h=c.length?c[c.length-1]:null,_=u.length?u[u.length-1]:null;r&&s&&(r.textContent=f!=null&&h!=null?(f-h).toFixed(1)+" C":"---",At(s,d,_o,c,zo,"C")),o&&a&&(o.textContent=_!=null?Math.round(_)+"%":"---",At(a,u,So,null,null,"%"))}L("historyFlow",i),L("historyReturn",i),L("historyDemand",i),i()}});var ne={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},Lt=24*3600,_e=18,Qe=4,we=54,Pe=20,ze=4,Oe=Q*(_e+Qe)-Qe+ze+Pe,ko=`
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg);
  padding: 10px 12px;
  box-shadow: var(--panel-shadow);
}

.timeline-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--accent);
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .75px;
  font-weight: 700;
}

.timeline-head strong {
  color: var(--text-faint);
  font-size: .70rem;
  font-weight: 500;
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
`;S("zone-state-timeline",ko);var Eo=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Co(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,s=o-Lt,a=1e3,i=a-we;function d(m){let x=(m-s)/Lt;return we+Math.max(0,Math.min(1,x))*i}let c="http://www.w3.org/2000/svg",u=document.createElementNS(c,"svg");u.setAttribute("viewBox","0 0 "+a+" "+Oe),u.classList.add("timeline-svg");let f=document.createElementNS(c,"rect");f.setAttribute("x",we),f.setAttribute("y",ze),f.setAttribute("width",i),f.setAttribute("height",Oe-ze-Pe),f.setAttribute("fill","rgba(10,24,46,0.55)"),f.setAttribute("rx","4"),u.appendChild(f);let h=[6,12,18,24];for(let m of h){let x=o-m*3600,F=d(x),b=document.createElementNS(c,"line");b.setAttribute("x1",F),b.setAttribute("y1",ze),b.setAttribute("x2",F),b.setAttribute("y2",Oe-Pe),b.setAttribute("stroke","rgba(120,168,255,.12)"),b.setAttribute("stroke-width","1"),u.appendChild(b)}for(let m=0;m<Q;m++){let x=ze+m*(_e+Qe),F=document.createElementNS(c,"rect");F.setAttribute("x",we),F.setAttribute("y",x),F.setAttribute("width",i),F.setAttribute("height",_e),F.setAttribute("fill",m%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),u.appendChild(F);let b=document.createElementNS(c,"text");b.setAttribute("x",we-4),b.setAttribute("y",x+_e/2+1),b.setAttribute("text-anchor","end"),b.setAttribute("dominant-baseline","middle"),b.setAttribute("fill","rgba(191,211,245,.65)"),b.setAttribute("font-size","9.5"),b.setAttribute("font-family","Montserrat, sans-serif"),b.setAttribute("font-weight","600"),b.textContent="Z"+(m+1),u.appendChild(b);let M=r.filter(C=>C[0]>=s).map(C=>({t:C[0],state:C[m+1]}));if(M.length===0)continue;let Z=M[0].t,q=M[0].state,B=(C,D,O)=>{if(O===255)return;let R=ne[O]||ne[255];if(R.color==="transparent")return;let V=d(C),Y=d(D),K=Math.max(1,Y-V),W=document.createElementNS(c,"rect");W.setAttribute("x",V),W.setAttribute("y",x+1),W.setAttribute("width",K),W.setAttribute("height",_e-2),W.setAttribute("fill",R.color),W.setAttribute("rx","2"),W.setAttribute("opacity","0.88"),u.appendChild(W)};for(let C=1;C<M.length;C++){let D=M[C];D.state!==q&&(B(Z,D.t,q),Z=D.t,q=D.state)}B(Z,o,q)}let _=Oe-Pe+14,v=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let m of v){let x=o-m.hoursAgo*3600,F=d(x),b=document.createElementNS(c,"text");b.setAttribute("x",F),b.setAttribute("y",_),b.setAttribute("text-anchor",m.hoursAgo===0?"end":"middle"),b.setAttribute("fill","rgba(191,211,245,.45)"),b.setAttribute("font-size","9"),b.setAttribute("font-family","Montserrat, sans-serif"),b.textContent=m.label,u.appendChild(b)}return u}function Ao(e){e.innerHTML="";let t=[{code:5,...ne[5]},{code:6,...ne[6]},{code:0,...ne[0]},{code:1,...ne[1]},{code:7,...ne[7]},{code:2,...ne[2]}];for(let r of t){let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+r.label,e.appendChild(o)}}var Ma=z({tag:"zone-state-timeline",render:Eo,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");Ao(o);function s(){let a=E("zoneStateHistory"),i=(()=>{let c=E&&E("zoneStateHistory");return c&&c.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!a||!a.entries||a.entries.length===0){let c=document.createElement("div");c.className="timeline-empty",c.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(c);return}let d=Co(a,i);d&&r.appendChild(d)}L("zoneStateHistory",s),L("zoneNames",s),s()}});var Fo=`
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
`;S("zone-grid",Fo);var Lo=()=>'<div class="zone-grid"></div>',Oa=z({tag:"zone-grid",render:Lo,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(T("zone-card",{zone:r}))}});var Mo=`
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 12px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,168,255,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(83,168,255,.42);
	border-left-color: rgba(83,168,255,.7);
	background: linear-gradient(180deg, rgba(28,58,103,.52), rgba(18,39,72,.46));
}
.zone-card.active {
	border-color: rgba(238,161,17,.44);
	border-left-color: rgba(238,161,17,.84);
	background: linear-gradient(180deg, rgba(238,161,17,.12), rgba(238,161,17,.04));
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,168,255,.35);
}

.zone-card.zs-heating { border-left-color: #EEA111; }
.zone-card.zs-idle { border-left-color: #53A8FF; }
.zone-card.zs-off { border-left-color: rgba(120,168,255,.4); }

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
	background: rgba(120,168,255,.4);
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
`;S("zone-card",Mo);var No=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${de(e.zone)}</div>
		<div class="zc-friendly">${re(e.zone)||"---"}</div>
	</div>
`,Ba=z({tag:"zone-card",state:e=>({zone:e.zone}),render:No,onMount(e,t){let r=e.zone,o=l.temp(r),s=l.state(r),a=l.enabled(r),i=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),c=t.querySelector(".zc-zone-name"),u=t.querySelector(".zc-friendly");function f(){let h=P(a),_=String(w(s)||"").toUpperCase()||"OFF",v=E("selectedZone")===r,m=re(r);c.textContent=de(r),u.textContent=m||I(y(o)),i.textContent=h?_:"OFF";let x=h?_:"OFF",F=x==="HEATING"?"#f2c77b":x==="IDLE"?"#79d17e":x==="FAULT"?"#ff7676":"#7D8BA7",b=x==="HEATING"?"#EEA111":x==="IDLE"?"#79d17e":x==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";i.style.color=F,d.style.background=b,d.style.boxShadow=x==="HEATING"?"0 0 5px rgba(238,161,17,.6)":x==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",v),t.classList.toggle("disabled",!h),t.classList.toggle("zs-heating",h&&_==="HEATING"),t.classList.toggle("zs-idle",h&&_!=="HEATING"),t.classList.toggle("zs-off",!h)}t.addEventListener("click",()=>{nt(r)}),g(o,f),g(s,f),g(a,f),L("selectedZone",f),L("zoneNames",f),f()}});var Do=`
.zone-detail {
  background: linear-gradient(180deg, rgba(20,44,79,.30), rgba(13,31,58,.24));
  border: 1px solid rgba(120,168,255,.30);
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
  background: rgba(238,161,17,.15);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.3);
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

/* Body layout */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(120,168,255,.18);
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
  border-color: rgba(238,161,17,.55);
  color: var(--accent);
  background: rgba(238,161,17,.1);
}

.zone-detail .zd-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.zone-detail .zd-toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.zone-detail .zd-toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.zone-detail .sw {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
}

.zone-detail .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.zone-detail .sw.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.zone-detail .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

.zone-detail .zd-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-stat {
  padding: 2px 0 6px;
  border-bottom: 1px solid rgba(120,168,255,.22);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.zone-detail .zd-stat-label {
  font-size: .62rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}
`;S("zone-detail",Do);var To=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${de(e.zone)}</div>
      <span class="zd-badge">---</span>
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
      <div class="zd-toggle-row"><span class="zd-toggle-label">Zone Enabled</span><div class="sw btn-toggle"></div></div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
    </div>
  </div>
`,Ya=z({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:To,methods:{update(e,t){let r=E("selectedZone"),o=String(w(l.state(r))||"").toUpperCase(),s=P(l.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=de(r),t.setpoint.textContent=I(y(l.setpoint(r))),t.temp.textContent=I(y(l.temp(r))),t.ret.textContent=I(y("sensor-manifold_return_temperature")),t.valve.textContent=ge(y(l.valve(r)));let a=t.badge;a.textContent=s?o||"IDLE":"DISABLED";let i=s?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";a.className="zd-badge"+(i?" "+i:""),t.toggleRow.classList.toggle("is-on",s),t.toggle.classList.toggle("on",s)},incSetpoint(){let e=this.zone,t=y(l.setpoint(e))||20;We(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=y(l.setpoint(e))||20;We(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=P(l.enabled(e));mt(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggleRow:t.querySelector(".zd-toggle-row"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),s=a=>{let i=E("selectedZone");(a===l.temp(i)||a===l.setpoint(i)||a===l.valve(i)||a===l.state(i)||a===l.enabled(i))&&o()};for(let a=1;a<=6;a++)g(l.temp(a),s),g(l.setpoint(a),s),g(l.valve(a),s),g(l.state(a),s),g(l.enabled(a),s);g("sensor-manifold_return_temperature",o),L("selectedZone",o),o()}});var Oo=`
.zone-sensor-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.zone-sensor-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-sensor-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.zone-sensor-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.zone-sensor-card .lbl-help {
  margin-top: -2px;
  color: var(--text-faint);
  font-size: .74rem;
  font-style: italic;
}

.zone-sensor-card .sel,
.zone-sensor-card .txt {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.zone-sensor-card .sel:focus,
.zone-sensor-card .txt:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.zone-sensor-card .ble-row .txt {
  flex: 1;
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
  background: rgba(83,168,255,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
`;S("zone-sensor-card",Oo);var Po=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
    <div class="zone-sensor-card">
      <div class="card-title">Temperature Sensors / Connectivity</div>
      <div class="cfg-row">
        <span class="lbl">Zone Return Temperature Sensor</span>
        <select class="sel zs-probe">${e}</select>
      </div>
      <div class="cfg-row">
        <span class="lbl">Temperature Source</span>
        <select class="sel zs-source"></select>
      </div>
      <div class="cfg-row zs-row-ble">
        <span class="lbl">BLE Sensor</span>
        <span class="lbl-help">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</span>
        <div class="ble-row">
          <input class="txt zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="cfg-row">
        <span class="lbl">Sync To Zone</span>
        <span class="lbl-help">Mirror target and control state from another zone.</span>
        <select class="sel zs-sync"></select>
      </div>
    </div>
  `};function Ro(e,t){let r=e.value,o="<option>None</option>";for(let s=1;s<=6;s++)s!==t&&(o+="<option>Zone "+s+"</option>");e.innerHTML=o,e.value=r||"None"}function qo(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Ho(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function Io(e,t){let r="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==r&&(e.innerHTML=r),e.value=t}var rn=z({tag:"zone-sensor-card",render:Po,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),s=t.querySelector(".zs-ble"),a=t.querySelector(".zs-sync"),i=t.querySelector(".zs-row-ble"),d=t.querySelector(".zs-scan"),c=t.querySelector(".zs-scan-list"),u=0;function f(){return E("selectedZone")}function h(){let v=f();u!==v&&(Ro(a,v),u=v,c.style.display="none");let m=w(l.probe(v)),x=String(w(l.tempSource(v))||""),F=qo(x),b=w(l.syncTo(v))||"None",M=w(l.ble(v))||"";m&&(r.value=m),Io(o,F),a.value=b,document.activeElement!==s&&(s.value=M),i.style.display=F==="BLE Sensor"?"":"none"}function _(v){let m=f();(v===l.probe(m)||v===l.tempSource(m)||v===l.syncTo(m)||v===l.ble(m))&&h()}d.addEventListener("click",()=>{d.disabled||(d.disabled=!0,d.textContent="\u2026",c.style.display="",c.innerHTML='<div class="scan-msg">Scanning\u2026</div>',fetch("/api/hv6/v1/ble-scan").then(v=>v.json()).then(v=>{if(d.disabled=!1,d.textContent="Scan",!v.ok||!v.sensors||v.sensors.length===0){c.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let m=f(),x=(w(l.ble(m))||"").toUpperCase(),F="";for(let b of v.sensors){let M=b.mac.toUpperCase(),Z=b.temp_c!=null?b.temp_c.toFixed(1)+"\xB0C":"\u2014",q=b.rssi!=null?b.rssi+" dBm":"",B=b.age_s<60?b.age_s+"s ago":Math.round(b.age_s/60)+"m ago",C="";M===x?C='<span class="ble-badge">assigned to this zone</span>':b.zone>0&&(C='<span class="ble-badge">zone '+b.zone+"</span>"),F+=`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${M}</div>
                <div class="ble-meta">${Z} &nbsp;${q} &nbsp;${B}</div>
                ${C}
              </div>
              <button class="btn-assign" data-mac="${M}">Assign</button>
            </div>`}c.innerHTML=F,c.querySelectorAll(".btn-assign").forEach(b=>{b.addEventListener("click",()=>{let M=b.dataset.mac;s.value=M,xe(m,"zone_ble_mac",M),c.style.display="none"})})}).catch(()=>{d.disabled=!1,d.textContent="Scan",c.innerHTML='<div class="scan-msg">Scan failed. Check device connectivity.</div>'}))}),r.addEventListener("change",()=>{pe(f(),"zone_probe",r.value)}),o.addEventListener("change",()=>{pe(f(),"zone_temp_source",Ho(o.value))}),a.addEventListener("change",()=>{pe(f(),"zone_sync_to",a.value)}),s.addEventListener("change",()=>{xe(f(),"zone_ble_mac",s.value)}),L("selectedZone",h);for(let v=1;v<=6;v++)g(l.probe(v),_),g(l.tempSource(v),_),g(l.syncTo(v),_),g(l.ble(v),_);h()}});var Zo=`
.zone-room-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.zone-room-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-room-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.zone-room-card .cfg-row.two-col {
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.zone-room-card .cfg-row > div:not(.wall-btn-group) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.zone-room-card .cfg-row.two-col > div {
  margin-bottom: 0;
}

@media (max-width: 480px) {
  .zone-room-card .cfg-row.two-col {
    grid-template-columns: 1fr;
  }
}

.zone-room-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.zone-room-card .txt,
.zone-room-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.zone-room-card .txt:focus,
.zone-room-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.zone-room-card .wall-lbl-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .75rem;
  color: var(--text-secondary);
  margin-top: 0;
  margin-bottom: 8px;
}

.zone-room-card .wall-lbl-hint::after {
  content: 'Select all that apply';
  font-style: italic;
}

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
  box-shadow: 0 0 0 1px rgba(83,168,255,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

@media (max-width: 680px) {
  .zone-room-card .wall-btn-group {
    grid-template-columns: repeat(5, 1fr);
  }
}
`;S("zone-room-card",Zo);var Bo=()=>`
  <div class="zone-room-card">
    <div class="card-title">Zone Settings</div>
    <div class="cfg-row"><span class="lbl">Friendly Name</span><input class="txt zr-friendly" maxlength="24" placeholder="e.g. Living Room"></div>
    <div class="cfg-row two-col">
      <div><span class="lbl">Zone Area</span><input class="txt zr-area" type="number" min="1" step="0.1" placeholder="m2"></div>
      <div><span class="lbl">Pipe Spacing C-C</span><input class="txt zr-spacing" type="number" min="50" step="5" placeholder="200"></div>
    </div>
    <div class="cfg-row"><span class="lbl">Pipe Type</span>
      <select class="sel zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select>
    </div>
    <div class="cfg-row">
      <span class="lbl">Exterior Walls</span>
      <div class="wall-lbl-hint"></div>
      <div class="wall-btn-group">
        <button class="wall-btn" data-wall="None">None</button>
        <button class="wall-btn" data-wall="N">N</button>
        <button class="wall-btn" data-wall="S">S</button>
        <button class="wall-btn" data-wall="E">E</button>
        <button class="wall-btn" data-wall="W">W</button>
      </div>
    </div>
  </div>
`,pn=z({tag:"zone-room-card",render:Bo,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),s=t.querySelector(".zr-spacing"),a=t.querySelector(".zr-pipe"),i=t.querySelectorAll(".wall-btn");function d(){return E("selectedZone")}function c(){let f=d();document.activeElement!==r&&(r.value=re(f)||""),document.activeElement!==o&&(o.value=y(l.area(f))!=null?String(y(l.area(f))):""),document.activeElement!==s&&(s.value=y(l.spacing(f))!=null?String(y(l.spacing(f))):""),a.value=w(l.pipeType(f))||"Unknown";let h=w(l.exteriorWalls(f))||"None",_=h==="None"?[]:h.split(",").filter(Boolean);i.forEach(v=>{let m=v.dataset.wall;v.classList.toggle("active",m==="None"?_.length===0:_.includes(m))})}function u(f){let h=d();(f===l.area(h)||f===l.spacing(h)||f===l.pipeType(h)||f===l.exteriorWalls(h))&&c()}r.addEventListener("change",()=>{lt(d(),r.value)}),o.addEventListener("change",()=>{je(d(),"zone_area_m2",o.value)}),s.addEventListener("change",()=>{je(d(),"zone_pipe_spacing_mm",s.value||"200")}),a.addEventListener("change",()=>{pe(d(),"zone_pipe_type",a.value)}),i.forEach(f=>{f.addEventListener("click",()=>{let h=f.dataset.wall,_=w(l.exteriorWalls(d()))||"None",v=_==="None"?[]:_.split(",").filter(Boolean);if(h==="None")v=[];else{let x=v.indexOf(h);x>=0?v.splice(x,1):v.push(h)}let m=["N","S","E","W"].filter(x=>v.includes(x));xe(d(),"zone_exterior_walls",m.length?m.join(","):"None")})}),L("selectedZone",c),L("zoneNames",c);for(let f=1;f<=6;f++)g(l.area(f),u),g(l.spacing(f),u),g(l.pipeType(f),u),g(l.exteriorWalls(f),u);c()}});var Wo=`
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
  stroke: #42a5f5;
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
`;S("flow-diagram",Wo);var te=6,Ot=[60,126,192,258,324,390],He=225,me=36,ke=160,Re=90,Se=me+ke,oe=640,jo=11,Ke=6,et=24,Ee=oe+20,Mt=oe+200,Nt=oe+360,Dt=oe+420,Pt="#7D8BA7",Rt="#6C7892",$o="#8FCBFF",Vo="#BCDFFF",Go="#E4D092",Uo="#F2B74C",Xo="#8FCBFF",Yo="#D8E7FF",Jo="#7D8BA7",Tt="#B7CBF0",tt="#6C7892",qe="#A3B6D9",Qo="#8EA4CD",Ko="#42A5F5",er="#66BB6A",tr="#EF5350";function Ie(e,t,r){var o=He+(e-2.5)*jo,s=Ot[e],a=oe-Se,i=Se+a*.33,d=Se+a*.67;return"M"+Se+" "+(o-t).toFixed(1)+" C"+i+" "+(o-t).toFixed(1)+" "+d+" "+(s-r).toFixed(1)+" "+oe+" "+(s-r).toFixed(1)+" L"+oe+" "+(s+r).toFixed(1)+" C"+d+" "+(s+r).toFixed(1)+" "+i+" "+(o+t).toFixed(1)+" "+Se+" "+(o+t).toFixed(1)+"Z"}function or(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function rr(e){let t=String(re(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function ar(e,t){return t?e==null||Number.isNaN(e)?Rt:e<.15?$o:e<.4?Vo:e<.7?Go:Uo:Pt}function nr(){var e=1160,t=460,r=He-Re/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var s=1;s<=te;s++)o.push('<linearGradient id="rg'+s+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+s+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+s+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var a=1;a<=te;a++){var i=Ie(a-1,Ke,et);o.push('<path d="'+i+'" fill="#1E2233" opacity="0.9"/>')}for(a=1;a<=te;a++){var d=Ie(a-1,Ke,et);o.push('<path id="fd-path-'+a+'" d="'+d+'" fill="url(#rg'+a+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+oe+'" y1="36" x2="'+oe+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var c=5,u=me-c;for(o.push('<rect x="0" y="'+r+'" width="'+u+'" height="'+Re+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+me+'" y="'+r+'" width="'+ke+'" height="'+Re+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(me+ke/2)+'" y="'+(He-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(me+ke/2)+'" y="'+(He+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(me+ke/2)+'" y="'+(r+Re+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Ee+'" y="34" font-size="11" fill="'+qe+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+Mt+'" y="34" font-size="11" fill="'+qe+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+Nt+'" y="34" font-size="11" fill="'+qe+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+Dt+'" y="34" font-size="11" fill="'+qe+'" font-weight="700" letter-spacing="2">RET</text>'),a=1;a<=te;a++){var f=Ot[a-1];o.push('<text id="fd-zn'+a+'" x="'+Ee+'" y="'+(f+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+a+"</text>"),o.push('<text id="fd-zf'+a+'" x="'+Ee+'" y="'+(f+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zsp'+a+'" x="'+(Ee+82)+'" y="'+(f+18)+'" font-size="11" fill="'+tt+'" font-weight="600" font-family="var(--mono)"></text>'),o.push('<text id="fd-zt'+a+'" x="'+Mt+'" y="'+(f+10)+'" font-size="16" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+a+'" x="'+Nt+'" y="'+(f+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+a+'" x="'+Dt+'" y="'+(f+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Qo+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+te+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var sr=()=>`<div class="flow-wrap">${nr()}</div>`;z({tag:"flow-diagram",render:sr,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(te+1)};for(let s=1;s<=te;s++)r.zones[s]={textTemp:t.querySelector("#fd-zt"+s),textSetpoint:t.querySelector("#fd-zsp"+s),textFlow:t.querySelector("#fd-zv"+s),textRet:t.querySelector("#fd-zr"+s),label:t.querySelector("#fd-zn"+s),friendly:t.querySelector("#fd-zf"+s),path:t.querySelector("#fd-path-"+s)};function o(){let s=y(n.flow),a=y(n.ret),i=r.flowEl,d=r.retEl,c=r.dtEl;if(i.textContent=I(s),d.textContent="RET "+I(a),s!=null&&a!=null){let u=Number(s)-Number(a);c.textContent=u.toFixed(1)+"\xB0C",c.setAttribute("fill",u<3?Ko:u>8?tr:er)}else c.textContent="---";for(let u=1;u<=te;u++){let f=y(l.temp(u)),h=y(l.setpoint(u)),_=y(l.valve(u)),v=P(l.enabled(u)),m=String(w(l.tempSource(u))||"Local Probe"),x=or(w(l.probe(u))||""),F=x?y(l.probeTemp(x)):null,b=r.zones[u],M=b.textTemp,Z=b.textSetpoint,q=b.textFlow,B=b.textRet,C=b.label,D=b.friendly,O=b.path,R=_!=null?Math.max(0,Math.min(100,Number(_)))/100:0;C.textContent="ZONE "+u;let V=rr(u);D.textContent=V||"---",C.setAttribute("fill",v?Yo:Jo),D.setAttribute("fill",v?Tt:tt),Z.setAttribute("fill",v?Tt:tt);let Y=D.getComputedTextLength?D.getComputedTextLength():0;Z.setAttribute("x",String(Ee+Y+8));let K=I(f),W=h!=null?I(h):null;if(M.textContent=K,Z.textContent=W?"("+W+")":"",q.textContent=ge(_),q.setAttribute("fill",ar(R,v)),m!=="Local Probe"&&F!=null&&!Number.isNaN(Number(F))?(B.textContent=I(F),B.setAttribute("fill",v?Xo:Pt)):(B.textContent="---",B.setAttribute("fill",Rt)),!v)O.setAttribute("d",Ie(u-1,1,2)),O.setAttribute("fill","#2A2D38"),O.setAttribute("opacity","0.4");else{let Zt=Math.max(3,R*et),Bt=Math.max(1.5,R*Ke);O.setAttribute("d",Ie(u-1,Bt,Zt)),O.setAttribute("fill","url(#rg"+u+")"),O.setAttribute("opacity","1")}}}g(n.flow,o),g(n.ret,o),L("zoneNames",o);for(let s=1;s<=te;s++)g(l.temp(s),o),g(l.setpoint(s),o),g(l.valve(s),o),g(l.enabled(s),o),g(l.probe(s),o),g(l.tempSource(s),o);for(let s=1;s<=8;s++)g(l.probeTemp(s),o);o()}});var ir=`
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
.btn:hover { background: var(--control-bg-hover); border-color: rgba(238,161,17,.5); color: #ffe7b9; }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;S("diag-i2c",ir);var lr=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,_n=z({tag:"diag-i2c",render:lr,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=E("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{bt()}),L("i2cResult",o),o()}});var dr=`
.diag-zone {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone .card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.card-title-preheat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .4px;
  text-transform: uppercase;
  border: 1.5px solid;
}

.card-title-preheat.on {
  border-color: rgba(100,255,100,.6);
  background: rgba(60,120,60,.4);
  color: #80FF80;
  box-shadow: 0 0 12px rgba(100,255,100,.2);
}

.card-title-preheat.off {
  border-color: rgba(120,120,120,.4);
  background: rgba(40,40,40,.3);
  color: #999999;
}

.card-title-preheat-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  box-shadow: 0 0 5px currentColor;
  flex-shrink: 0;
}

.card-title-preheat-dot.on {
  background: #60FF60;
  box-shadow: 0 0 8px rgba(96,255,96,.8);
}

.card-title-preheat-dot.off {
  background: #666666;
  box-shadow: 0 0 3px rgba(102,102,102,.4);
}
.dz-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 900px) { .dz-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .dz-grid { grid-template-columns: 1fr; } }

.dz-zone-card {
  background: linear-gradient(180deg, rgba(20,44,79,.30), rgba(13,31,58,.24));
  border: 1px solid rgba(120,168,255,.30);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dz-zone-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dz-zone-name {
  font-size: .88rem;
  font-weight: 800;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: .6px;
}
.dz-state-badge {
  font-size: .62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .7px;
  border-radius: 999px;
  padding: 3px 9px;
  border: 1px solid transparent;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
}
.dz-state-badge.s-heating {
  background: rgba(238,161,17,.15);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.3);
}
.dz-state-badge.s-idle {
  background: rgba(121,209,126,.12);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.24);
}
.dz-state-badge.s-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

.dz-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.dz-stat {
  border-radius: 0;
  padding: 2px 0 6px;
  border-bottom: 1px solid rgba(120,168,255,.22);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dz-stat-label {
  font-size: .62rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dz-stat-value {
  font-size: .88rem;
  font-weight: 800;
  color: var(--text-strong);
  font-family: var(--mono);
}

.dz-motor-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 10px;
}
.dz-motor-label {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.dz-motor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
}
.dz-motor-param {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed rgba(120,168,255,.24);
  padding: 2px 0 5px;
  font-size: .76rem;
  gap: 4px;
}
.dz-motor-param.preheat-advance {
  grid-column: 1 / -1;
}
.dz-motor-param-name {
  color: var(--text-secondary);
  white-space: nowrap;
}
.dz-motor-param-val {
  color: var(--text-strong);
  font-family: var(--mono);
  font-weight: 700;
}

.dz-fault-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
  margin-top: 4px;
}
.dz-fault-label {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.dz-fault-val {
  color: var(--state-danger);
  font-weight: 700;
  font-family: var(--mono);
}
`;S("diag-zone",dr);function cr(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function qt(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Ht(e){return e!=null?Number(e).toFixed(0):"---"}function pr(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var gr=()=>{let e="";for(let t=1;t<=6;t++)e+=`
      <div class="dz-zone-card" data-zone="${t}">
        <div class="dz-zone-head">
          <span class="dz-zone-name">Zone ${t}</span>
          <span class="dz-state-badge" data-dz-state="${t}">---</span>
        </div>
        <div class="dz-stats">
          <div class="dz-stat"><span class="dz-stat-label">Room Temp</span><span class="dz-stat-value" data-dz-temp="${t}">---</span></div>
          <div class="dz-stat"><span class="dz-stat-label">Flow %</span><span class="dz-stat-value" data-dz-valve="${t}">---</span></div>
          <div class="dz-stat"><span class="dz-stat-label">Return</span><span class="dz-stat-value" data-dz-ret="${t}">---</span></div>
        </div>
        <div class="dz-motor-section">
          <div class="dz-motor-label">Motor ${t} learned parameters</div>
          <div class="dz-motor-grid">
            <div class="dz-motor-param"><span class="dz-motor-param-name">Open ripples</span><span class="dz-motor-param-val" data-dz-orip="${t}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Close ripples</span><span class="dz-motor-param-val" data-dz-crip="${t}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Open factor</span><span class="dz-motor-param-val" data-dz-ofac="${t}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Close factor</span><span class="dz-motor-param-val" data-dz-cfac="${t}">---</span></div>
            <div class="dz-motor-param preheat-advance"><span class="dz-motor-param-name">Preheat advance</span><span class="dz-motor-param-val" data-dz-ph="${t}">---</span></div>
          </div>
          <div class="dz-fault-row" data-dz-faultrow="${t}" style="display:none">
            <span class="dz-fault-label">Last fault</span>
            <span class="dz-fault-val" data-dz-fault="${t}">NONE</span>
          </div>
        </div>
      </div>`;return`
    <div class="diag-zone">
      <div class="card-title">
        <span>Zone Snapshot</span>
        <div class="card-title-preheat off" role="status" aria-live="polite" data-preheat-badge>
          <span class="card-title-preheat-dot off"></span>
          <span>Preheat: Off</span>
        </div>
      </div>
      <div class="dz-grid">${e}</div>
    </div>
  `},Fn=z({tag:"diag-zone",render:gr,onMount(e,t){function r(s){let a=String(w(l.state(s))||"").toUpperCase()||"OFF",i=P(l.enabled(s)),d=t.querySelector('[data-dz-state="'+s+'"]');d.textContent=i?a:"OFF",d.className="dz-state-badge"+(i?" "+cr(a):""),t.querySelector('[data-dz-temp="'+s+'"]').textContent=I(y(l.temp(s))),t.querySelector('[data-dz-valve="'+s+'"]').textContent=ge(y(l.valve(s))),t.querySelector('[data-dz-ret="'+s+'"]').textContent=I(y(n.ret)),t.querySelector('[data-dz-orip="'+s+'"]').textContent=Ht(y(l.motorOpenRipples(s))),t.querySelector('[data-dz-crip="'+s+'"]').textContent=Ht(y(l.motorCloseRipples(s))),t.querySelector('[data-dz-ofac="'+s+'"]').textContent=qt(y(l.motorOpenFactor(s))),t.querySelector('[data-dz-cfac="'+s+'"]').textContent=qt(y(l.motorCloseFactor(s))),t.querySelector('[data-dz-ph="'+s+'"]').textContent=pr(y(l.preheatAdvance(s)));let c=String(w(l.motorLastFault(s))||"").toUpperCase(),u=c&&c!=="NONE"&&c!=="OK",f=t.querySelector('[data-dz-faultrow="'+s+'"]');f.style.display=u?"flex":"none",u&&(t.querySelector('[data-dz-fault="'+s+'"]').textContent=c)}for(let s=1;s<=6;s++){let a=s,i=()=>r(a);g(l.state(a),i),g(l.enabled(a),i),g(l.temp(a),i),g(l.valve(a),i),g(n.ret,i),g(l.motorOpenRipples(a),i),g(l.motorCloseRipples(a),i),g(l.motorOpenFactor(a),i),g(l.motorCloseFactor(a),i),g(l.preheatAdvance(a),i),g(l.motorLastFault(a),i),r(a)}function o(){let s=t.querySelector("[data-preheat-badge]"),a=s.querySelector(".card-title-preheat-dot"),i=s.querySelector("span:last-child"),c=(w(n.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";s.classList.toggle("on",c),s.classList.toggle("off",!c),a.classList.toggle("on",c),a.classList.toggle("off",!c),i.textContent=c?"Preheat: On":"Preheat: Off"}g(n.simplePreheatEnabled,o),o()}});var ur=`
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
  scrollbar-color: rgba(83,168,255,.25) transparent;
}
.diag-log::-webkit-scrollbar { width: 5px; }
.diag-log::-webkit-scrollbar-thumb { background: rgba(83,168,255,.25); border-radius: 999px; }
.diag-log::-webkit-scrollbar-track { background: transparent; }

.diag-log-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 16px; }
.diag-log-item { display: flex; gap: 8px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: .78rem; line-height: 1.4; }
.diag-log-item:last-child { border-bottom: none; }
.diag-log-time { font-family: var(--mono); color: var(--accent); font-size: .7rem; white-space: nowrap; flex-shrink: 0; }
.diag-log-msg { color: var(--text-strong); opacity: .9; }
`;S("diag-activity",ur);var mr=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function br(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var Tn=z({tag:"diag-activity",render:mr,onMount(e,t){let r=t.querySelector(".diag-log");function o(){br(r,dt())}L("activityLog",o),o()}});var fr=`
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
`;S("diag-manual-badge",fr);var vr=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Hn=z({tag:"diag-manual-badge",render:vr,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let s=!!E("manualMode");r&&r.classList.toggle("on",s)}L("manualMode",o),o()}});var xr=`
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
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
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
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
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
  border-color: rgba(238,161,17,.5);
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
  background: #dbe8ff;
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: rgba(83,168,255,.4);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
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
`;S("diag-zone-motor",xr);var hr=e=>{let t=e.zone||E("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Vn=z({tag:"diag-zone-motor-card",render:hr,onMount(e,t){let r=Number(e.zone||E("selectedZone")||1),o=!!E("manualMode"),s=t.querySelector(".manual-mode-toggle"),a=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),c=t.querySelector(".motor-open-btn"),u=t.querySelector(".motor-close-btn"),f=t.querySelector(".motor-stop-btn");function h(m){o=!!m,s&&(s.classList.toggle("on",o),s.setAttribute("aria-checked",o?"true":"false")),a&&a.classList.toggle("locked",!o),[i,d,c,u,f].forEach(x=>{x&&(x.disabled=!o)})}function _(){let m=!o;if(h(m),m){Ve(!0);for(let x=1;x<=6;x++)$e(x)}else Ve(!1)}function v(){let m=y(l.motorTarget(r));d&&m!=null?d.value=Number(m).toFixed(0):d&&(d.value="0")}i==null||i.addEventListener("change",()=>{r=Number(i.value||1),v()}),s==null||s.addEventListener("click",_),s==null||s.addEventListener("keydown",m=>{m.key!==" "&&m.key!=="Enter"||(m.preventDefault(),_())});for(let m=1;m<=6;m++)g(l.motorTarget(m),v);v(),h(o),L("manualMode",()=>{h(!!E("manualMode"))}),d==null||d.addEventListener("change",m=>{if(!o)return;let x=m.target.value;ft(r,x)}),c==null||c.addEventListener("click",()=>{o&&vt(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&xt(r,1e4)}),f==null||f.addEventListener("click",()=>{o&&$e(r)})}});var yr=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
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
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
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
  border-color: rgba(238,161,17,.5);
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
`;S("diag-zone-recovery",yr);var wr=e=>{let t=e.zone||E("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
    <div class="diag-zone-recovery">
      <div class="card-title">Motor Recovery</div>
      <div class="cfg-row">
        <span class="lbl">Motor</span>
        <select class="sel recovery-zone-select">${r}</select>
      </div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
    </div>
  `},Qn=z({tag:"diag-zone-recovery-card",render:wr,onMount(e,t){let r=Number(e.zone||E("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),s=t.querySelector(".recovery-fault-btn"),a=t.querySelector(".recovery-factors-btn"),i=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),s==null||s.addEventListener("click",()=>{ht(r)}),a==null||a.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&yt(r)}),i==null||i.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&wt(r)})}});var _r=`
.settings-manifold-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-manifold-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-manifold-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.settings-manifold-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.settings-manifold-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-manifold-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  border: 1px solid var(--control-border);
  border-radius: 10px;
  padding: 10px;
  background: var(--control-bg);
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .5px;
}

.settings-manifold-card .probe-temp {
  margin-top: 4px;
  font-size: 1rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .settings-manifold-card .probe-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;S("settings-manifold-card",_r);var zr=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},ss=z({tag:"settings-manifold-card",render:zr,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),s=t.querySelector(".sm-ret");function a(){r.value=w(n.manifoldType)||"NO (Normally Open)",o.value=w(n.manifoldFlowProbe)||"Probe 7",s.value=w(n.manifoldReturnProbe)||"Probe 8";for(let i=1;i<=8;i++){let d=t.querySelector('[data-probe="'+i+'"]'),c=y(l.probeTemp(i));d&&(d.textContent=I(c))}}r.addEventListener("change",()=>X("manifold_type",r.value)),o.addEventListener("change",()=>X("manifold_flow_probe",o.value)),s.addEventListener("change",()=>X("manifold_return_probe",s.value)),g(n.manifoldType,a),g(n.manifoldFlowProbe,a),g(n.manifoldReturnProbe,a);for(let i=1;i<=8;i++)g(l.probeTemp(i),a);a()}});var Sr=`
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

/* Match Helios toggle styling for consistency */
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
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-card .btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.settings-card .absorb-badge {
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

.settings-card .absorb-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}

.settings-card .num-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.settings-card .num-row .lbl {
  display: block;
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.settings-card .num-row .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
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
  border-color: rgba(120,168,255,.52);
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
`;S("settings-control-card",Sr);var kr=()=>`
  <div class="settings-control-stack">
    <div class="settings-card settings-functionality-card">
      <div class="card-title">Functionality</div>
      <div class="toggle-row">
        <span class="toggle-label">Motor Drivers</span>
        <div class="ui-toggle drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Simple Preheat</span>
        <div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Preheat Absorption <span class="absorb-badge">idle</span></span>
        <div class="ui-toggle absorb-toggle" role="switch" aria-label="Toggle preheat absorption"></div>
      </div>
      <div class="num-row">
        <div>
          <span class="lbl">Absorb band (\xB0C)</span>
          <input class="inp absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" />
        </div>
        <div>
          <span class="lbl">Detect delta (\xB0C)</span>
          <input class="inp absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" />
        </div>
      </div>
    </div>

    <div class="settings-card settings-action-card">
      <div class="card-title">Control</div>
      <div class="btn-row">
        <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
        <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
        <button class="btn warn sc-restart">Restart Device</button>
      </div>
    </div>
  </div>
`,us=z({tag:"settings-control-card",render:kr,onMount(e,t){let r=t.querySelector(".drivers-toggle"),o=t.querySelector(".preheat-toggle"),s=r.closest(".toggle-row"),a=o.closest(".toggle-row");function i(){return P(n.drivers)}function d(){let b=i();r.classList.toggle("on",b),s.classList.toggle("is-on",b),r.setAttribute("aria-checked",b?"true":"false")}r.addEventListener("click",()=>{Ne(!i())}),g(n.drivers,d),d();function c(){let b=String(w(n.simplePreheatEnabled)||"").toLowerCase();return b==="on"||b==="true"||b==="1"||b==="enabled"}function u(){let b=c();o.classList.toggle("on",b),a.classList.toggle("is-on",b),o.setAttribute("aria-checked",b?"true":"false")}o.addEventListener("click",()=>{let b=!c();X("simple_preheat_enabled",b?"on":"off")}),g(n.simplePreheatEnabled,u),u();let f=t.querySelector(".absorb-toggle"),h=f.closest(".toggle-row"),_=t.querySelector(".absorb-badge"),v=t.querySelector(".absorb-band"),m=t.querySelector(".absorb-delta");function x(){let b=P(n.preheatAbsorbEnabled);f.classList.toggle("on",b),h.classList.toggle("is-on",b),f.setAttribute("aria-checked",b?"true":"false");let M=String(w(n.preheatAbsorbing)||"").toLowerCase()==="active";_.textContent=M?"active":"idle",_.classList.toggle("active",M)}f.addEventListener("click",()=>{let b=P(n.preheatAbsorbEnabled)?"off":"on";p(n.preheatAbsorbEnabled,{state:b}),X("preheat_absorb_enabled",b)});function F(){let b=y(n.preheatAbsorbBandC),M=y(n.preheatDetectDeltaC);document.activeElement!==v&&b!=null&&(v.value=b),document.activeElement!==m&&M!=null&&(m.value=M)}v.addEventListener("blur",()=>{let b=parseFloat(v.value);b>=0&&b<=5&&(p(n.preheatAbsorbBandC,{value:b}),$("preheat_absorb_band_c",b))}),m.addEventListener("blur",()=>{let b=parseFloat(m.value);b>=2&&b<=25&&(p(n.preheatDetectDeltaC,{value:b}),$("preheat_detect_delta_c",b))}),g(n.preheatAbsorbEnabled,x),g(n.preheatAbsorbing,x),g(n.preheatAbsorbBandC,F),g(n.preheatDetectDeltaC,F),x(),F(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ae("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ae("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ae("restart")})}});var Er=`
.settings-motor-cal-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-motor-cal-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-motor-cal-card .hint {
  color: var(--text-secondary);
  font-size: .78rem;
  margin-bottom: 12px;
}

.settings-motor-cal-card .cfg-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.settings-motor-cal-card .cfg-row {
  display: grid;
  gap: 6px;
}

.settings-motor-cal-card .cfg-row.full {
  grid-column: 1 / -1;
}

.settings-motor-cal-card .lbl {
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.settings-motor-cal-card .txt {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .86rem;
}

.settings-motor-cal-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .86rem;
}

.settings-motor-cal-card .txt:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-motor-cal-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-motor-cal-card .unit {
  color: var(--text-faint);
  font-size: .7rem;
}

.settings-motor-cal-card .runtime-note {
  grid-column: 1 / -1;
  color: var(--state-warn);
  font-size: .74rem;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  border-radius: 10px;
  padding: 8px 10px;
}

@media (max-width: 960px) {
  .settings-motor-cal-card .cfg-grid { grid-template-columns: 1fr; }
}
`;S("settings-motor-calibration-card",Er);var be=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:n.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:n.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:n.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:n.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:n.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:n.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:n.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:n.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:n.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:n.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:n.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:n.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Cr=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<be.length;r++){let o=be[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function Ar(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function It(e,t){let r=Number(t);return Number.isFinite(r)?Ar(e)?String(Math.round(r)):r.toFixed(2):"0"}var ys=z({tag:"settings-motor-calibration-card",render:Cr,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function s(i){if(i==="HmIP VdMot"&&$("hmip_runtime_limit_seconds",40),i==="Generic"){let d=Number(y(n.genericRuntimeLimitSeconds));(!Number.isFinite(d)||d<=0)&&$("generic_runtime_limit_seconds",45)}}function a(){let i=w(n.motorProfileDefault)||"HmIP VdMot";r&&(r.value=i),o&&(i==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=It("generic_runtime_limit_seconds",y(n.genericRuntimeLimitSeconds)),o.disabled=!1));for(let d=0;d<be.length;d++){let c=be[d],u=t.querySelector(".smc-"+c.cls);u&&c.key!=="generic_runtime_limit_seconds"&&(u.value=It(c.key,y(c.id)))}}r&&(r.addEventListener("change",()=>{X("motor_profile_default",r.value),s(r.value)}),g(n.motorProfileDefault,a));for(let i=0;i<be.length;i++){let d=be[i],c=t.querySelector(".smc-"+d.cls);c&&(c.addEventListener("change",()=>{if(d.key==="generic_runtime_limit_seconds"){if((w(n.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;$("generic_runtime_limit_seconds",c.value);return}$(d.key,c.value)}),g(d.id,a))}g(n.genericRuntimeLimitSeconds,a),g(n.hmipRuntimeLimitSeconds,a),s(w(n.motorProfileDefault)||"HmIP VdMot"),a()}});var Fr=`
.settings-helios-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-helios-card .card-title {
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

.settings-helios-card .helios-status-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}

.settings-helios-card .helios-status-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}

.settings-helios-card .helios-status-badge.degraded {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border: 1px solid rgba(255,200,50,.35);
}

.settings-helios-card .helios-status-badge.offline {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-helios-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.settings-helios-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.settings-helios-card .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-helios-card .inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-helios-card .row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
  align-items: start;
}

.settings-helios-card .row-2col .cfg-row {
  margin-bottom: 0;
}

.settings-helios-card .enable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-helios-card .enable-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-helios-card .enable-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.settings-helios-card .enable-toggle {
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

.settings-helios-card .enable-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-helios-card .enable-row.is-on .enable-toggle {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-helios-card .enable-row.is-on .enable-toggle::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-helios-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}

.settings-helios-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 4px;
  line-height: 1.4;
}

@media (max-width: 980px) {
  .settings-helios-card .row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .settings-helios-card .row-2col .cfg-row {
    margin-bottom: 0;
  }
}
`;S("settings-helios-card",Fr);var Lr=()=>`
  <div class="settings-helios-card">
    <div class="card-title">
      <span>Helios Integration</span>
      <span class="helios-status-badge offline">offline</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Integration enabled</span>
      <div class="enable-toggle" role="switch" aria-label="Toggle Helios integration"></div>
    </div>

    <div class="section-title">Connection</div>
    <div class="cfg-row">
      <span class="lbl">Host</span>
      <input class="inp sh-host" type="text" placeholder="192.168.1.x or hostname" maxlength="63" />
    </div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Port</span>
        <input class="inp sh-port" type="number" min="1" max="65535" step="1" placeholder="8080" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Controller ID</span>
        <input class="inp sh-cid" type="text" maxlength="32" />
        <span class="note sh-cid-note">Leave blank to use device ID</span>
      </div>
    </div>

    <div class="section-title">Timing</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Poll interval (s)</span>
        <input class="inp sh-poll" type="number" min="5" max="3600" step="1" placeholder="30" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Stale after (s)</span>
        <input class="inp sh-stale" type="number" min="10" max="86400" step="1" placeholder="600" />
        <span class="note">Clear Helios commands when no contact for this long</span>
      </div>
    </div>
  </div>
`,Cs=z({tag:"settings-helios-card",render:Lr,onMount(e,t){let r=t.querySelector(".helios-status-badge"),o=t.querySelector(".enable-row"),s=t.querySelector(".enable-toggle"),a=t.querySelector(".sh-host"),i=t.querySelector(".sh-port"),d=t.querySelector(".sh-cid"),c=t.querySelector(".sh-cid-note"),u=t.querySelector(".sh-poll"),f=t.querySelector(".sh-stale");function h(){let m=w(n.heliosStatus)||"offline";r.textContent=m,r.className="helios-status-badge "+m}function _(){let m=P(n.heliosEnabled);o.classList.toggle("is-on",m),o.classList.toggle("is-off",!m),s.setAttribute("aria-checked",m?"true":"false")}s.addEventListener("click",()=>{let m=P(n.heliosEnabled),F=!m?"on":"off";console.log(`[Helios] Toggle clicked: ${m?"on":"off"} -> ${F}`),p(n.heliosEnabled,{state:F}),X("helios_enabled",F).catch(b=>{console.error("[Helios] Failed to send toggle state to backend:",b),p(n.heliosEnabled,{state:m?"on":"off"})})}),a.addEventListener("blur",()=>{let m=a.value.trim();p(n.heliosHost,{state:m}),he("helios_host",m).catch(x=>console.error("[Helios] Failed to update host:",x))}),d.addEventListener("blur",()=>{let m=d.value.trim();p(n.heliosControllerId,{state:m}),he("helios_controller_id",m).catch(x=>console.error("[Helios] Failed to update controller_id:",x))}),i.addEventListener("blur",()=>{let m=parseInt(i.value,10);m>=1&&m<=65535&&(p(n.heliosPort,{value:m}),$("helios_port",m).catch(x=>console.error("[Helios] Failed to update port:",x)))}),u.addEventListener("blur",()=>{let m=parseInt(u.value,10);m>=5&&m<=3600&&(p(n.heliosPollIntervalS,{value:m}),$("helios_poll_interval_s",m).catch(x=>console.error("[Helios] Failed to update poll_interval_s:",x)))}),f.addEventListener("blur",()=>{let m=parseInt(f.value,10);m>=10&&m<=86400&&(p(n.heliosStaleAfterS,{value:m}),$("helios_stale_after_s",m).catch(x=>console.error("[Helios] Failed to update stale_after_s:",x)))});function v(){let m=w(n.heliosHost),x=w(n.heliosControllerId),F=w(n.heliosDeviceId)||"heatvalve-6",b=y(n.heliosPort),M=y(n.heliosPollIntervalS),Z=y(n.heliosStaleAfterS);document.activeElement!==a&&m!=null&&(a.value=m),document.activeElement!==d&&(x!=null&&(d.value=x),d.placeholder=F,c.textContent="Leave blank to use device ID: "+F),document.activeElement!==i&&b!=null&&(i.value=b||8080),document.activeElement!==u&&M!=null&&(u.value=M||30),document.activeElement!==f&&Z!=null&&(f.value=Z||600)}g(n.heliosStatus,h),g(n.heliosEnabled,_),g(n.heliosHost,v),g(n.heliosControllerId,v),g(n.heliosDeviceId,v),g(n.heliosPort,v),g(n.heliosPollIntervalS,v),g(n.heliosStaleAfterS,v),h(),_(),v()}});var Mr=`
.settings-asgard-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-asgard-card .card-title {
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

.settings-asgard-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.settings-asgard-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.settings-asgard-card .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-asgard-card .inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-asgard-card .row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
  align-items: start;
}

.settings-asgard-card .row-2col .cfg-row {
  margin-bottom: 0;
}

.settings-asgard-card .enable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-asgard-card .enable-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-asgard-card .enable-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.settings-asgard-card .enable-toggle {
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

.settings-asgard-card .enable-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-asgard-card .enable-row.is-on .enable-toggle {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-asgard-card .enable-row.is-on .enable-toggle::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-asgard-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}

.settings-asgard-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 4px;
  line-height: 1.4;
}

.settings-asgard-card .status-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
}

.settings-asgard-card .status-grid .val {
  color: var(--text);
  font-weight: 600;
}

.settings-asgard-card .status-grid .val.warn {
  color: #FFE9A0;
}

@media (max-width: 980px) {
  .settings-asgard-card .row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .settings-asgard-card .row-2col .cfg-row {
    margin-bottom: 0;
  }
}
`;S("settings-asgard-card",Mr);var Nr=()=>`
  <div class="settings-asgard-card">
    <div class="card-title">
      <span>Asgard / Ecodan Bridge</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Bridge enabled</span>
      <div class="enable-toggle sa-enable" role="switch" aria-label="Toggle Asgard bridge"></div>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Coordinator (pushes to Asgard)</span>
      <div class="enable-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div>
    </div>

    <div class="section-title">Asgard</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Host</span>
        <input class="inp sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Port</span>
        <input class="inp sa-port" type="number" min="1" max="65535" step="1" placeholder="80" />
      </div>
    </div>
    <div class="cfg-row">
      <span class="lbl">Number entity</span>
      <input class="inp sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" />
      <span class="note">Asgard REST object_id receiving the weighted house temperature</span>
    </div>

    <div class="section-title">Peer board</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Peer host</span>
        <input class="inp sa-peer" type="text" placeholder="empty = single board" maxlength="63" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Push interval (s)</span>
        <input class="inp sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" />
      </div>
    </div>

    <div class="section-title">Status</div>
    <div class="status-grid">
      <span>Peer</span><span class="val sa-st-peer">n/a</span>
      <span>Last push</span><span class="val sa-st-push">\u2014</span>
      <span>Zones weighted</span><span class="val sa-st-zones">\u2014</span>
      <span>Last error</span><span class="val sa-st-err">\u2014</span>
    </div>
  </div>
`,Ts=z({tag:"settings-asgard-card",render:Nr,onMount(e,t){let r=t.querySelector(".asgard-role-badge"),o=t.querySelector(".sa-enable").closest(".enable-row"),s=t.querySelector(".sa-coord").closest(".enable-row"),a=t.querySelector(".sa-enable"),i=t.querySelector(".sa-coord"),d=t.querySelector(".sa-host"),c=t.querySelector(".sa-port"),u=t.querySelector(".sa-entity"),f=t.querySelector(".sa-peer"),h=t.querySelector(".sa-interval"),_=t.querySelector(".sa-st-peer"),v=t.querySelector(".sa-st-push"),m=t.querySelector(".sa-st-zones"),x=t.querySelector(".sa-st-err");function F(C,D,O,R,V){return C.addEventListener("click",()=>{let Y=P(O),K=Y?"off":"on";p(O,{state:K}),X(R,K).catch(W=>{console.error(`[Asgard] Failed to update ${V}:`,W),p(O,{state:Y?"on":"off"})})}),()=>{let Y=P(O);D.classList.toggle("is-on",Y),D.classList.toggle("is-off",!Y),C.setAttribute("aria-checked",Y?"true":"false")}}let b=F(a,o,n.asgardEnabled,"asgard_enabled","enabled"),M=F(i,s,n.asgardCoordinator,"asgard_coordinator","coordinator");function Z(C,D,O){C.addEventListener("blur",()=>{let R=C.value.trim();p(D,{state:R}),he(O,R).catch(V=>console.error(`[Asgard] Failed to update ${O}:`,V))})}Z(d,n.asgardHost,"asgard_host"),Z(u,n.asgardEntityName,"asgard_entity_name"),Z(f,n.asgardPeerHost,"asgard_peer_host"),c.addEventListener("blur",()=>{let C=parseInt(c.value,10);C>=1&&C<=65535&&(p(n.asgardPort,{value:C}),$("asgard_port",C).catch(D=>console.error("[Asgard] Failed to update port:",D)))}),h.addEventListener("blur",()=>{let C=parseInt(h.value,10);C>=5&&C<=3600&&(p(n.asgardPushIntervalS,{value:C}),$("asgard_push_interval_s",C).catch(D=>console.error("[Asgard] Failed to update push_interval_s:",D)))});function q(){let C=w(n.asgardRole)||"slave";r.textContent=C,r.className="asgard-role-badge "+(C==="master"?"master":"slave");let D=w(n.asgardPeerStatus)||"n/a";_.textContent=D,_.classList.toggle("warn",D==="stale"||D==="unreachable");let O=y(n.asgardLastPushC),R=y(n.asgardLastPushAgeS);if(O!=null&&Number.isFinite(O)&&R!=null){let W=R<120?`${Math.round(R)}s ago`:`${Math.round(R/60)}m ago`;v.textContent=`${O.toFixed(2)}\xB0C (${W})`}else v.textContent="\u2014";let V=y(n.asgardLocalZones),Y=y(n.asgardPeerZones);m.textContent=V!=null?`${V} local + ${Y||0} peer`:"\u2014";let K=w(n.asgardLastError);x.textContent=K||"\u2014",x.classList.toggle("warn",!!K)}function B(){let C=w(n.asgardHost),D=w(n.asgardEntityName),O=w(n.asgardPeerHost),R=y(n.asgardPort),V=y(n.asgardPushIntervalS);document.activeElement!==d&&C!=null&&(d.value=C),document.activeElement!==u&&D!=null&&(u.value=D),document.activeElement!==f&&O!=null&&(f.value=O),document.activeElement!==c&&R!=null&&(c.value=R||80),document.activeElement!==h&&V!=null&&(h.value=V||30)}g(n.asgardEnabled,b),g(n.asgardCoordinator,M),g(n.asgardRole,q),g(n.asgardPeerStatus,q),g(n.asgardLastPushC,q),g(n.asgardLastPushAgeS,q),g(n.asgardLocalZones,q),g(n.asgardPeerZones,q),g(n.asgardLastError,q),g(n.asgardHost,B),g(n.asgardEntityName,B),g(n.asgardPeerHost,B),g(n.asgardPort,B),g(n.asgardPushIntervalS,B),b(),M(),q(),B()}});var Dr=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");

:root {
  --accent: #EEA111;
  --blue: #53A8FF;
  --bg: #0E1A2C;
  --surface: #132744;
  --card: #0F213C;
  --border: rgba(120,168,255,.24);
  --text: #FFFFFF;
  --text-strong: #F3F8FF;
  --text-secondary: rgba(214,228,255,.86);
  --muted: rgba(214,228,255,.78);
  --text-faint: rgba(191,211,245,.58);
  --text-on-accent: #101C30;
  --soft: rgba(132,180,255,.12);
  --panel-border: rgba(120,168,255,.28);
  --panel-bg: linear-gradient(180deg, rgba(20,44,79,.42), rgba(13,31,58,.36));
  --panel-bg-vibrant: radial-gradient(900px 300px at 90% -40%, rgba(83,168,255,.18), transparent 62%), linear-gradient(180deg, rgba(20,44,79,.44), rgba(13,31,58,.38));
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
  --state-ok: #79d17e;
  --state-warn: #f2c77b;
  --state-danger: #ff7676;
  --state-disabled: #7D8BA7;
  --control-bg: rgba(83,168,255,.1);
  --control-bg-hover: rgba(83,168,255,.16);
  --control-border: rgba(120,168,255,.32);
  --control-border-strong: rgba(120,168,255,.45);
  --viz-flow-low: #8FCBFF;
  --viz-flow-mid: #BCDFFF;
  --viz-flow-high: #E4D092;
  --viz-flow-hot: #F2B74C;
  --viz-delta-low: #42A5F5;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #EF5350;
  --green: #79d17e;
  --red: #ff6464;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; scroll-behavior: smooth; }
body {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(238,161,17,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(83,168,255,.2), transparent 64%),
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
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-connectivity,
.overview-flow-return,
.overview-demand {
  display: flex;
  flex-direction: column;
}

.overview-connectivity > *,
.overview-flow-return > *,
.overview-demand > * {
  flex: 1;
}

.zone-layout,
.diag-layout,
.settings-layout {
  display: grid;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > * {
  flex: 1;
}

.settings-layout {
  grid-template-columns: 1.15fr .85fr;
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: linear-gradient(180deg, rgba(20,44,79,.42), rgba(13,31,58,.36));
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

@media (max-width: 1080px) {
  .dashboard-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout { grid-template-columns: 1fr; }

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
  outline: 2px solid rgba(83,168,255,.72);
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
`;S("app-root",Dr);var Tr=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
          <div class="overview-connectivity"></div>
          <div class="overview-flow-return"></div>
          <div class="overview-demand"></div>
        </div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-sensor-slot"></div>
          <div class="zone-room-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="diagnostics">
        <div class="diag-manual-badge-slot"></div>
        <div class="diag-layout"></div>
      </section>
      <section class="sec" data-section="settings">
        <div class="settings-layout">
          <div class="settings-manifold-slot"></div>
          <div class="settings-control-slot"></div>
          <div class="settings-motor-cal-slot"></div>
          <div class="settings-helios-slot"></div>
          <div class="settings-asgard-slot"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;z({tag:"app-root",render:Tr,onMount(e,t){t.querySelector(".hdr").appendChild(T("hv6-header")),t.querySelector(".overview-flow").appendChild(T("flow-diagram")),t.querySelector(".overview-timeline").appendChild(T("zone-state-timeline")),t.querySelector(".overview-connectivity").appendChild(T("connectivity-card")),t.querySelector(".overview-flow-return").appendChild(T("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(T("graph-widgets",{variant:"demand"})),t.querySelector(".zone-selector").appendChild(T("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(T("zone-detail",{zone:E("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(T("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(T("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(T("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(T("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(T("settings-motor-calibration-card")),t.querySelector(".settings-helios-slot").appendChild(T("settings-helios-card")),t.querySelector(".settings-asgard-slot").appendChild(T("settings-asgard-card")),t.querySelector(".diag-manual-badge-slot").appendChild(T("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(T("diag-i2c")),r.appendChild(T("diag-activity")),r.appendChild(T("diag-zone"));let o=E("selectedZone")||1;r.appendChild(T("diag-zone-motor-card",{zone:o})),r.appendChild(T("diag-zone-recovery-card",{zone:o}));let s=t.querySelectorAll(".sec");function a(){let i=E("section");s.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===i)})}L("section",a),a()}});function Or(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(T("app-root")),Xe()}Or();})();
