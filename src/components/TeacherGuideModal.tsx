import React from 'react';
import { X, BookOpen, Lightbulb, CheckCircle2, Atom, Sparkles } from 'lucide-react';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToScene: (time: number) => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToScene,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              Tanári Segédlet & 11. Osztályos Kémiai Tananyag
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-sm mb-2">
              <Atom className="w-4 h-4" />
              <span>1. Miért szükséges a hibridizáció elmélete?</span>
            </div>
            <p className="mb-2">
              A szénatom alapállapoti elektronkonfigurációja{' '}
              <strong className="text-white">1s² 2s² 2p²</strong>. A Hund-szabály szerint a 2p alhéjon csak
              2 darab párosítatlan elektron található (a harmadik 2p pálya üres).
            </p>
            <p className="mb-2 text-amber-300/90 font-medium">
              A klasszikus vegyértékkötés-elmélet alapján a szénnek csak két kovalens kötést kellene létesítenie!
            </p>
            <p>
              A kísérleti tapasztalat ezzel szemben azt mutatja, hogy a metánban (<strong className="text-white">CH₄</strong>)
              a szénatom <strong className="text-cyan-300">négy darab teljesen egyenértékű</strong> kovalens kötést létesít,
              amelyek egymással pontosan <strong className="text-yellow-400">109,5°-os</strong> kötésszöget zárnak be,
              tökéletes tetraéderes szimmetriát alkotva.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>2. A kétlépéses modell: Gerjesztés és Hibridizáció</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="font-bold text-amber-400 block mb-1">A) Elektrongerjesztés (C*)</span>
                <p className="text-[11px] text-slate-300">
                  Energiabefektetés hatására a 2s pálya egyik elektronja átkerül az üres 2p pályára:{' '}
                  <code className="text-white bg-slate-800 px-1 py-0.5 rounded">1s² 2s¹ 2p³</code>.
                  Így már 4 párosítatlan elektron van, de az 1 db s és a 3 db p pálya alakja és energiája még különbözik!
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700">
                <span className="font-bold text-cyan-400 block mb-1">B) sp³ Hibridizáció (Pauling, 1931)</span>
                <p className="text-[11px] text-slate-300">
                  Az 1 db 2s és a 3 db 2p pálya hullámfüggvényeinek lineáris kombinációjából{' '}
                  <strong className="text-cyan-300">4 darab új, azonos alakú és energiájú sp³ hibridpálya</strong> keletkezik.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-cyan-300 font-semibold mb-1">
              Új vizuális funkció: Közös térbeli elrendezés (Kezdeti + Végső állapot egymás mellett):
            </p>
            <p className="text-[11px] text-slate-300 mb-2">
              A 3D nézet bal oldalán a négy különálló kiindulási pálya (gömb 2s, valamint a különálló 2px, 2py, 2pz kétlebenyes pályák)
              látható a saját elektrondobozaikkal és nyilaikkal ([2s ↑↓], [2px ↑], [2py ↑], [2pz ∅ → ↑]).
              A jobb oldalon pedig a négy sp³ hibridpálya egyenkénti kialakulása és a tetraéderes metán molekula követhető nyomon!
            </p>
            <p className="text-[11px] text-slate-400 italic">
              Fontos didaktikai megjegyzés: A hibridizáció matematikai és szemléltető modell, nem a valóságban időben
              egymásba gyúródó szilárd testek folyamata.
            </p>
          </div>

          {/* Section 3: Ethane formation & Free Rotation */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
              <Atom className="w-4 h-4" />
              <span>3. Az Etán (C₂H₆) képződése & A C–C σ-kötés szabad rotációja</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">Központi C–C σ-kötés:</strong> A két szénatom egy-egy sp³ hibridpályájának
                fej-fej melletti (axiális) átfedésével jön létre (kötéshossz: <strong className="text-emerald-300">154 pm</strong>, kötési energia: ~348 kJ/mol).
              </li>
              <li>
                <strong className="text-white">Szabad rotáció:</strong> Mivel a szigma-kötés elektronsűrűsége hengerszimmetrikus a két magot összekötő tengely mentén,
                a két -CH₃ csoport szobahőmérsékleten akadálytalanul el tud fordulni egymáshoz képest (szabad rotáció).
                A szimuláció a legstabilabb, minimális energiájú <strong className="text-cyan-300">nyitott (staggered)</strong> konformációt mutatja be.
              </li>
              <li>
                <strong className="text-white">6 db C–H σ-kötés:</strong> A fennmaradó 3-3 db sp³ hibridpálya és a hidrogénatomok 1s pályáinak átfedésével alakul ki.
                Összesen a molekulában <strong className="text-yellow-400">7 db kovalens kötés</strong> van!
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>4. A hibridpályák alakja és a tetraéderes elrendezés</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">Aszimmetrikus alak:</strong> A hibridpályának van egy nagy, terjedelmes
                pozitív fázisú lebenye (ahol a 2s és 2p fázisa megegyezik és erősíti egymást), és a mag túloldalán egy kis
                hátsó lebenye.
              </li>
              <li>
                <strong className="text-white">Nagyobb kötési energia:</strong> A nagy lebeny sokkal hatékonyabb térbeli
                átfedést tesz lehetővé a partneratommal (pl. a hidrogén 1s elektronfelhőjével), ami erősebb, stabilabb σ-kötést eredményez.
              </li>
              <li>
                <strong className="text-white">VSEPR-modell kapcsolata:</strong> A 4 kötő elektronpár minimális taszításra
                törekszik a térben, ezért a szabályos tetraéder négy csúcsa felé irányulnak: a kötésszög{' '}
                <strong className="text-yellow-400">109,5°</strong> (pontosan arccos(-1/3) ≈ 109°28').
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Gyors ugrópontok az órai demonstrációhoz</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                onClick={() => {
                  onJumpToScene(0);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-left transition"
              >
                <div className="font-bold text-sky-400">1. Alapállapot</div>
                <div className="text-[10px] text-slate-400">1s² 2s² 2p²</div>
              </button>
              <button
                onClick={() => {
                  onJumpToScene(10);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-left transition"
              >
                <div className="font-bold text-amber-400">2. Gerjesztés</div>
                <div className="text-[10px] text-slate-400">2s → 2p átmenet</div>
              </button>
              <button
                onClick={() => {
                  onJumpToScene(20);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-left transition"
              >
                <div className="font-bold text-cyan-400">3. Hibridizáció</div>
                <div className="text-[10px] text-slate-400">s + 3p → 4 sp³</div>
              </button>
              <button
                onClick={() => {
                  onJumpToScene(30);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-left transition"
              >
                <div className="font-bold text-yellow-400">4. Tetraéder</div>
                <div className="text-[10px] text-slate-400">109,5° kötésszög</div>
              </button>
              <button
                onClick={() => {
                  onJumpToScene(45);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-left transition"
              >
                <div className="font-bold text-emerald-400">5. Metán (CH₄)</div>
                <div className="text-[10px] text-slate-400">4 db C–H σ kötés</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
