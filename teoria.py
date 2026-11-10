import math
import statistics
import os 

#Parametros de entrada

#Mesas
md = 6
#Asientos por mesa ocupados
m1 = 1
m2 = 3
m3 = 4
m4 = 2
m5 = 3
m6 = 2
#Cola de espera(clientes)
colaAct=m1+m2+m3+m4+m5+m6
print(f"Clientes en cola={colaAct}")

#parametros de entrada
c=2 #meseros
lamb=12 #Tasa de servicio (clientes/minuto) (lambda)
mu=15 #tasa de llegada(clientes/minuto) (mu)
fo=lamb/ (c*mu) #factor de ocupacion
if fo<1:
    print(f"Sistema ocupado y funcionando={fo*100}%")
else:
    print("sistema colapsado")

lq=(lamb**2)/(mu*(mu-lamb)) #clientes en cola
print(f"Clientes en la cola:{lq} clientes")

wq=lq/lamb #tiempo en cola 1 servidor
print(f"Tiempo promedio en cola:{wq*60} minutos")

#Probabilidad de que el sistema este en vacio rho-cero
suma=0
for x in range(c+1):
    suma=suma+(lamb/mu)**x/math.factorial(x)
po=1/(suma+((lamb/mu)/math.factorial(c))*((c*mu)/(c*mu-lamb)))
print(f"Probabilidad de que el sistema este vacio:{po*100}%")

#clientes promedio en cola multiples servidores
lqm=po*((lamb/mu)**c)*(lamb/mu)/(c*(1-(lamb/mu))**2)
print(f"Clientes promedio en cola:{lqm} con {c} meseros")
wqq=lqm/lamb
print(f"Tiempo promedio en cola:{wqq*60} minutos con {c} servidores")

#clientes promedio en el sistema multiples servidores
lm=lqm+(lamb/mu)
print(f"Clientes promedio en el sistema:{lm} con {c} meseros")

#tiempo promedio en el sistema multiples servidores
wm=wqq+(1/mu)
print(f"Tiempo promedio en el sistema:{wm*60} minutos con {c} servidores")
