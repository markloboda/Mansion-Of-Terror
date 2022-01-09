<!-- NASLOVNICA -->

# Računalniška grafika

## Povzetek

Igra Mansion of Terror je strašljiva sestavljanka. Vse sobe so temne, edina svetloba prihaja iz svetilke kar poskrbi za bolj strašno vzdušje, v ozadju pa se tudi predvaja strašljiva glasba.
Svetilka je realizirana v glsl senčilniku. V igri so objekti s katerimi igralec lahko interektira. Ob interakciji se lahko zgodijo različne stvari, ponavadi pa so to animacije.

## 1.) Opis sveta
Igra se dogaja v stavbi s tremi sobami.
Igralec mora priti čez vse 3 sobe, da lahko zbeži in s tem zaključi igro.
V svetu, kjer se dogaja igra, so na 3d modelih uporabljene različne texture,
da je izgled igre čim bolj realističen in vživljajoč.

## Ključne lokacije
Klučne lokacije v igri so lokacije interakcij, kjer mora igralec interaktirati s predmeti, da lahko napreduje.
To so:
- V prvi sobi:
    - prostor kjer igralec pobere varovalko s tal,
    - varovalna omarica, kamor igralec vstavi varovalko,
    - dvižna vrata, ki se lahko odprejo le ko igralec poveže električni krog z vstavljanjem varovalke v omarico,
    - stikalo za dvižna vrata

- V drugi sobi:
    - prostor, na koncu stopnic, kjer se stopnice udrejo, in igralec z njimi pade v črno globino, da se zgodi prehod v tretjo sobo,
    - Ko igralec zaključi s tretjo sobo se ponovno znajde v drugi sobi, sedaj lahko odpre vrata dvigala, dvigalo pa ga popelje v konec igre

- V tretji sobi:
    - prostor na drugem koncu kanalizacije, kjer je lestev, katero mora igralec doseči za napredovanje,
    - do lestve za napredovanje pride s prečaknjem kanalizacijskega potoka na večih mestih, s pomočjo skakanja po odpadkih in ruševinah, ki so v potoku

## Velikost
Velikosti sob so približne meram prostorov v realnem življenju,
Prva soba ki je skladišče, je večja in vsebuje velike police.

## Objekti
Vse modele objektov in sob smo izdelali sami s pomočjo programa blender, teksture pa smo našli na spletu in nekatere modificirali.
Poglavitni objekti so varovalka, dvižna vrata, stikalo za dvižna vrata, tla, ki se vdrejo, vrata dvigala.
![](./screenshots/room1_blender1.png)
![](./screenshots/room1_blender2.png)
![](./screenshots/room2_blender1.png)
![](./screenshots/room2_blender2.png)
![](./screenshots/room3_blender1.png)
![](./screenshots/room3_blender2.png)
![](./screenshots/room2_blender3.png)

## 2.) Igralni pogon in uporabljene tehnologije

Za izdelavo igre smo uporabili samo webgl2 + JavaScript, modele in animacije smo naložili iz gltf blender izvozov. Za bazo igralnega pogona smo uporabili 90-gltf primer iz webgl2-examples repozitorija: https://github.com/UL-FRI-LGM/webgl2-examples/tree/master/examples/90-gltf  

V izhodiščnem primeru je bilo veliko stvari že implementiranih, ker smo hoteli modele vključno z animacijami izvoziti iz blenderja, smo v GLTFLoader.js dodali še podporo za nalaganje animacij. Naredili smo tudi razred Animation, ki hrani "keyframe" in metode za interpolacije med keyframe-i.  
Podprte animacije:
- Step interpolation
- Linear interpolation
- Spherical linear interpolation

Izhodiščni primer smo tudi nasploh naredili bolj fleksibilen, npr. naredili smo nov razred MeshRenderer in ga ob nalaganju iz gltf datoteke pripeli na Node objekt. Če bi se v prihodnosti odločili, da bi naš pogon podpiral tudi Armature in animacije armatur bi lahko naredili še en razred, ki bi uporabljal nek drug senčilnik, v render zanki pa bi še vedno klicali samo node.renderer.render()...  

Ker ima naša igra določen nek potek (npr: Preden igralec lahko odpre vrata, mora pritisniti gumb), smo si sami zamislili nek json format za opisovanje dogodkov.

### Primer formata:  

```js
export const scenes = {
  Room1: {
    name: "first_room",
    interactables: [
      { name: "Flashlight", type: "carry", carrying: true },
      {
        name: "Switch",
        type: "interact",
        interact: { play: ["SwitchAnimation"] },
        setConditions: ["switch_active"]
      },
    ],
    animations: {
      SwitchAnimation: {
        after: ["trigger"],
        trigger: ["door_open_action"]
      }
    },
    door_open_action: {
      conditions: ["switch_active"],
      after: ["gotoNextLevel"]
    }
  }
}
```

### Interpretacija zgornjega opisa iz formata:  
- Definirana sta dva interactables objekta. 
  - Prvi je Flashlight, ki je definiran v vsaki sobi. Flashlight ima definiran `type: carry`, kar pomeni; ko bo igralec interaktiral s Flashlight objektom, ga bo nosil s seboj. Objekt bo imel od tam naprej rotacijo in translacijo od kamere. 
  - Drugi interactable objekt je Switch, ko interaktiramo z njim se zažene animacija SwitchAnimation, ki je definirana spodaj, postavi se pogoj `switch_active`.

- Definirani sta dve animaciji. 
  - Prva je SwitchAnimation, animacija ima definiran `after: ["trigger"]`, to je ime funkcije, ki se bo izvedla po animaciji. `trigger` je funkcija, ki sproži animacijo. V tem primeru se sproži animacija definirana pod trigger property-jom -> `trigger: ["door_open_action"]`. Animacija se sproži pogojno: `conditions: ["switch_active"]`.Lahko se sproži več animacij.
  - Ko se sproži door_open_action, se izvede gotoNextLevel, ki naloži naslednjo sobo.

## Detekcija trkov
V igri smo uporabili tehnologijo AABB. To je okrajšava za Axis Aligned Boundry Box. Pri tej vrsti detekcije trkov ima vsak objekt okoli sebe škatlo, katere robovi so poravnani z svetovnim kordinatnim sistemom. Detekcije trkov preverjamo v datoteki Physics.js.



6 Zakljucki in mo ˇ zne nadgradnje ˇ
V poglavju povzemite cesa ste se pri izdelavi igre nau ˇ cili. ˇ
Ali ste pri predmetu pridobili dovolj znanja oz. kje je bilo
pomanjkanje? Povzemite tudi do kaksnih razlik je pri ˇ slo ˇ
med predvidenim scenarijem in koncno izvedbo igre. 

## Pogled
Uporabili smo Perspektivno kamero uvoženo iz blenderja preko gltf-ja.
Igralca se ne vidi.  

## 3.) Uporabniški vmesnik
Naredili smo meni v katerem lahko uporabnik prične z igranjem igre, na voljo pa mu je tudi opcija options. Če uporabnik klikne options, se mu odpre meni v katerem lahko nastavlja glasnost zvoka in občutljivost miške.

Med samim igranjem igre se na ekranu lahko pokaže "Press [F] to interact." ali "Press [F] tp carry.", s tem napisom uporabniku sporočimo, da je v bližini nekega objekta s katerim lahko upravlja.
![carry prompt](./screenshots/room1_gameplay2.png)

## 4.) Glasba in zvok
Med igranjem igre se predvaja strašljiva glasba. Nivo glasnosti lahko znižamo v meniju.
Poleg glasbe, ki se predvaja konstantno, se ob hoji in teku sliši tudi zvok stopinj. 
Zvok stopinj se predvaja hitreje ko tečeš in počasneje ko hodiš.
