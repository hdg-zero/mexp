{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "mexp";
  buildInputs = [
    pkgs.nodejs_23
    pkgs.docker
  ];

  shellHook = ''
    echo "Environnement Nix prêt !"
  '';
}