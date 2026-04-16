# Example usage
````
import { ev, es } from '../core/store.js';
import { fmtT, fmtState } from '../utils/format.js';
import { key } from '../utils/keys.js';
import { setTextIfChanged } from '../utils/dom.js';

function update(el, z) {
  setTextIfChanged(
    el.temp,
    fmtT(ev(key.temp(z)))
  );

  setTextIfChanged(
    el.state,
    fmtState(es(key.state(z)))
  );
}
````