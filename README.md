# NuPIC port in JavaScript

## Usage

### Running Tests

    open test/index.html

## Design Decisions

### Differences between this Spatial Pooler and the Python Spatial Pooler

- Mapping of column index to input space distributes columns over indices uniformly, rather than mapping adjacent columns to adjacent inputs.
- Mapping of columns to their potential pools supports N-dimensional columns and K-dimensional inputs.
- Permanences are initialized according to whitepaper description, keeping permanences in a small range around the connected threshold, with inputs closer to the column center likely having a higher initial permanence.

## Todo

### Spatial Pooler

- Investigate ASP, ASP+M, ASP+G as detailed in [Evaluating Sparse Codes on Handwritten Digits](http://link.springer.com/chapter/10.1007/978-3-319-03680-9_40)
