# Tareas Visuales

## 1. Datos y sus tipos

Los datos a visualizar son de fumadores a nivel global en los años 1997 y 2010. Las **entidades** son los países, y los **atributos** son el número de fumadores y los nombres de los países. El tipo de datos incluye:

- **Cuantitativo**: Número de fumadores por país.
- **Categórico**: Nombre de los países.

## 2. Tareas: "Analizar", "Buscar", "Consultar"

Las posibles tareas visuales identificadas son:

1. **Visión General**:

- **Meta**: Ofrecer una vista global de la prevalencia de fumadores.
- **Visualización**: Un mapa coroplético que use colores para representar el número de fumadores por país.

2. **Comparación**:

- **Meta**: Comparar los cambios entre 1997 y 2010.
- **Visualización**: Mapas comparativos lado a lado o con un deslizador interactivo para cambiar entre ambos años.

3. **Detalles Bajo Demanda**:

- **Meta**: Ver datos detallados de países específicos.
- **Visualización**: Herramientas de hover para mostrar el número exacto de fumadores al pasar el cursor sobre un país.

4. **Filtrado**:

- **Meta**: Permitir a los usuarios enfocar en regiones o países específicos.
- **Visualización**: Filtros para seleccionar continentes o rangos de población.

5. **Correlación**:

- **Meta**: Explorar posibles relaciones entre los fumadores y otros factores.
- **Visualización**: Gráficos de dispersión para analizar relaciones entre la prevalencia de fumadores y otras variables.

## 3. Técnicas de Visualización

Para implementar estas tareas:

- **Interacción**: Uso de tooltips (descripción al pasar el ratón) y deslizadores para alternar entre los datos de 1997 y 2010.
- **Comparación**: Múltiples vistas, como mapas lado a lado o pequeños múltiples, que permitan una comparación clara entre los años.
- **Escala de colores**: Usar escalas perceptualmente uniformes para diferenciar claramente los niveles de fumadores, evitando malentendidos en la interpretación.
