---
license: MIT
language: Python
---

## Features
- Scenarios: Each test setup lives in `molecule/<scenario>/` with its own `molecule.yml`, so you can test a role against several distros or configurations.
- Full test lifecycle: dependency, create, prepare, converge, idempotence, verify and destroy, run in order by `molecule test`.
- Idempotence check: Runs your role a second time and fails if anything reports "changed", which catches the most common Ansible bug.
- Drivers: Docker and Podman (via molecule-plugins), delegated or custom drivers for VMs and cloud instances.
- Verifiers: Write checks as an Ansible playbook (the default) or use Testinfra (pytest) assertions.
- Fast iteration: `molecule converge` and `molecule login` let you apply changes and poke around without a full teardown.

## Strengths
- Turns Ansible roles into tested code, with the same confidence you'd expect from application code.
- The idempotence check alone catches a lot of real-world bugs.
- Runs well in CI, so every pull request to a role gets tested on clean machines.
- It's the standard tool in the Ansible community, so most well-maintained public roles ship Molecule scenarios.

## Watch out for
- Containers aren't full VMs: roles that manage systemd, kernels or networking need special privileged images or a VM driver.
- Full runs are slow (minutes), so use `converge` during development and `test` in CI.
- Molecule 6 changed drivers and the `init` commands; many older tutorials and blog posts are out of date.

## Alternatives
- ansible-test: Ansible's own tool for sanity, unit and integration tests of collections; complementary to Molecule.
- Test Kitchen (kitchen-ansible): The Chef-world equivalent, also usable with Ansible.
- Vagrant + manual runs: Real VMs, but no structured lifecycle or idempotence checks.

## In depth
### How a test run works
`molecule test` creates fresh instances (for example Docker containers built from images you choose), runs any `prepare` playbook, applies your role with the `converge` playbook, applies it again to prove idempotence, runs your `verify` checks, and finally destroys everything. Each step is also available on its own, which is what makes the development loop fast.

### A Docker-based scenario

```bash
pip install molecule "molecule-plugins[docker]" ansible-core
cd roles/my_role
molecule init scenario --driver-name docker
```

```yaml
# molecule/default/molecule.yml
driver:
  name: docker
platforms:
  - name: ubuntu
    image: geerlingguy/docker-ubuntu2204-ansible
    pre_build_image: true
  - name: rocky
    image: geerlingguy/docker-rockylinux9-ansible
    pre_build_image: true
provisioner:
  name: ansible
verifier:
  name: ansible
```

```yaml
# molecule/default/verify.yml
- name: Verify
  hosts: all
  gather_facts: false
  tasks:
    - name: Nginx package is installed
      ansible.builtin.package:
        name: nginx
        state: present
      check_mode: true
      register: pkg
      failed_when: pkg.changed
```

### The development loop

```bash
molecule converge   # apply the role (re-run after each edit)
molecule login      # shell into an instance to inspect it
molecule verify     # run your checks
molecule test       # the full clean-room run, as in CI
molecule destroy    # clean up
```

### Good to know
- Community images with systemd and Python already installed (such as the geerlingguy images above) save a lot of setup.
- Add `molecule test` to your CI matrix per scenario, so a failure tells you exactly which platform broke.
