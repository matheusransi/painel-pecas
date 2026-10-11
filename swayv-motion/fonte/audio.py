import numpy as np, wave
SR=48000; D=20.0; N=int(SR*D); t=np.arange(N)/SR
out=np.zeros(N); rng=np.random.default_rng(3)
def env(start,a,dur,shape):
    i0=int(start*SR); n=int(dur*SR); n=min(n,N-i0)
    return i0,n
def add(start,sig):
    i0=int(start*SR); n=min(len(sig),N-i0); out[i0:i0+n]+=sig[:n]
def kick(amp=1.0):
    n=int(.45*SR); tt=np.arange(n)/SR
    f=45+110*np.exp(-tt*28); ph=2*np.pi*np.cumsum(f)/SR
    return amp*np.sin(ph)*np.exp(-tt*7.5)
def hat(amp=.18):
    n=int(.06*SR); x=rng.standard_normal(n); x=np.diff(np.concatenate([[0],x]))
    return amp*x*np.exp(-np.arange(n)/SR*70)
def impact(amp=1.0,dur=2.5):
    n=int(dur*SR); tt=np.arange(n)/SR
    sub=np.sin(2*np.pi*(38+40*np.exp(-tt*6))*tt)*np.exp(-tt*1.6)
    nz=rng.standard_normal(n); nz=np.convolve(nz,np.ones(40)/40,'same')*np.exp(-tt*5)*2.5
    return amp*(sub+nz*.4)
def swell(start,dur,f0=55,amp=.35):
    n=int(dur*SR); tt=np.arange(n)/SR
    e=(tt/dur)**2
    s=np.sin(2*np.pi*f0*tt)+.5*np.sin(2*np.pi*f0*1.5*tt)+.3*np.sin(2*np.pi*f0*2.003*tt)
    add(start,amp*e*s)
# 0-3.5 ruído de tecido + drone subindo
n=int(3.5*SR); nz=rng.standard_normal(n); nz=np.convolve(nz,np.ones(12)/12,'same')
add(0, nz*.12*np.sin(np.linspace(0,np.pi,n))*(0.6+0.4*np.sin(np.arange(n)/SR*2*np.pi*1.6)))
swell(0.0,3.5,55,.22)
# 3.5 impacto suave, pad durante a formação
add(3.5,impact(.55,3.0)); swell(3.5,3.5,82.4,.28)
# riser antes do 7.0
n=int(1.5*SR); tt=np.arange(n)/SR; r=rng.standard_normal(n)*(tt/1.5)**3*.35
add(5.5,r)
# 7.0-15.5 kick em todo beat, hats no contratempo de 9 a 13
for k in range(int((15.5-7.0)/.5)):
    tb=7.0+k*.5; add(tb,kick(1.0 if k%2==0 else .85))
    if 9.0<=tb<13.0: add(tb+.25,hat())
    if 9.0<=tb<13.0 and k%2==1: add(tb+.125,hat(.08))
# baixo no 9-13
for k in range(8):
    tb=9.0+k*.5; n=int(.45*SR); tt=np.arange(n)/SR
    f=[55,55,65.4,49][ (k//2)%4 ]
    add(tb, .35*np.tanh(2*np.sin(2*np.pi*f*tt))*np.exp(-tt*4))
add(7.0,impact(.9)); add(15.5,impact(1.0,4.5))
# pad final
n=int(4.5*SR); tt=np.arange(n)/SR
pad=sum(np.sin(2*np.pi*f*tt+i) for i,f in enumerate([110,164.8,220,277.2]))*.07
add(15.5,pad*np.minimum(tt/.8,1)*np.exp(-tt*.6))
# master
out=np.tanh(out*1.1); out/=np.max(np.abs(out))*1.12
fade=np.ones(N); fn=int(.4*SR); fade[-fn:]=np.linspace(1,0,fn); out*=fade
st=np.stack([out,out],1)
with wave.open('music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st*32767).astype(np.int16).tobytes())
print('ok')
