// Initial Starter Templates for CV Workshop Challenges
const WorkshopTemplates = {
  // Challenge A: Iron Man Palm Repulsor (starts empty as requested)
  challengeA: `<xml xmlns="https://developers.google.com/blockly/xml"></xml>`,

  // Challenge B: Finger Counter (starts empty as requested)
  challengeB: `<xml xmlns="https://developers.google.com/blockly/xml"></xml>`,

  // Challenge C: Draw a Shape & Predict (scaffold: drawing trail ON + 3 empty if-shape condition blocks)
  challengeC: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ai_draw_trail" x="240" y="40">
    <field name="STATE">true</field>
    <next>
      <block type="controls_if">
        <value name="IF0">
          <block type="logic_compare">
            <field name="OP">EQ</field>
            <value name="B">
              <block type="ai_shape_value">
                <field name="SHAPE">Circle</field>
              </block>
            </value>
          </block>
        </value>
        <next>
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">EQ</field>
                <value name="B">
                  <block type="ai_shape_value">
                    <field name="SHAPE">Triangle</field>
                  </block>
                </value>
              </block>
            </value>
            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="logic_compare">
                    <field name="OP">EQ</field>
                    <value name="B">
                      <block type="ai_shape_value">
                        <field name="SHAPE">Square</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`
};

// Full Working Solutions for CV Workshop Challenges (Triggered secretly by Alt+A)
const WorkshopSolutions = {
  // Challenge A Solution: Iron Man Palm Repulsor with Multi-finger attachments & Banner
  challengeA: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="controls_if" x="240" y="50">
    <value name="IF0">
      <block type="logic_compare">
        <field name="OP">EQ</field>
        <value name="A">
          <block type="ai_sensor">
            <field name="FEATURE">fingers</field>
          </block>
        </value>
        <value name="B">
          <block type="math_number">
            <field name="NUM">5</field>
          </block>
        </value>
      </block>
    </value>
    <statement name="DO0">
      <block type="ai_attach_sprite">
        <field name="SPRITE">ironman</field>
        <field name="TARGET">palm</field>
        <next>
          <block type="ai_attach_sprite">
            <field name="SPRITE">magic_circle</field>
            <field name="TARGET">index</field>
            <next>
              <block type="ai_attach_sprite">
                <field name="SPRITE">rasengan</field>
                <field name="TARGET">pinky</field>
                <next>
                  <block type="ai_attach_sprite">
                    <field name="SPRITE">magic_circle</field>
                    <field name="TARGET">thumb</field>
                    <next>
                      <block type="ai_print_text">
                        <value name="TEXT">
                          <block type="text">
                            <field name="TEXT">💥 Computer Vision II</field>
                          </block>
                        </value>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,

  // Challenge B Solution: 5-Finger Detection (1 to 5)
  challengeB: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="controls_if" x="240" y="50">
    <value name="IF0">
      <block type="logic_compare">
        <field name="OP">EQ</field>
        <value name="A">
          <block type="ai_sensor">
            <field name="FEATURE">fingers</field>
          </block>
        </value>
        <value name="B">
          <block type="math_number">
            <field name="NUM">1</field>
          </block>
        </value>
      </block>
    </value>
    <statement name="DO0">
      <block type="ai_print_text">
        <value name="TEXT">
          <block type="text">
            <field name="TEXT">1 Finger Detected</field>
          </block>
        </value>
      </block>
    </statement>
    <next>
      <block type="controls_if">
        <value name="IF0">
          <block type="logic_compare">
            <field name="OP">EQ</field>
            <value name="A">
              <block type="ai_sensor">
                <field name="FEATURE">fingers</field>
              </block>
            </value>
            <value name="B">
              <block type="math_number">
                <field name="NUM">2</field>
              </block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="ai_print_text">
            <value name="TEXT">
              <block type="text">
                <field name="TEXT">2 Fingers Detected</field>
              </block>
            </value>
          </block>
        </statement>
        <next>
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">EQ</field>
                <value name="A">
                  <block type="ai_sensor">
                    <field name="FEATURE">fingers</field>
                  </block>
                </value>
                <value name="B">
                  <block type="math_number">
                    <field name="NUM">3</field>
                  </block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="ai_print_text">
                <value name="TEXT">
                  <block type="text">
                    <field name="TEXT">3 Fingers Detected</field>
                  </block>
                </value>
              </block>
            </statement>
            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="logic_compare">
                    <field name="OP">EQ</field>
                    <value name="A">
                      <block type="ai_sensor">
                        <field name="FEATURE">fingers</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="math_number">
                        <field name="NUM">4</field>
                      </block>
                    </value>
                  </block>
                </value>
                <statement name="DO0">
                  <block type="ai_print_text">
                    <value name="TEXT">
                      <block type="text">
                        <field name="TEXT">4 Fingers Detected</field>
                      </block>
                    </value>
                  </block>
                </statement>
                <next>
                  <block type="controls_if">
                    <value name="IF0">
                      <block type="logic_compare">
                        <field name="OP">EQ</field>
                        <value name="A">
                          <block type="ai_sensor">
                            <field name="FEATURE">fingers</field>
                          </block>
                        </value>
                        <value name="B">
                          <block type="math_number">
                            <field name="NUM">5</field>
                          </block>
                        </value>
                      </block>
                    </value>
                    <statement name="DO0">
                      <block type="ai_print_text">
                        <value name="TEXT">
                          <block type="text">
                            <field name="TEXT">5 Fingers Detected</field>
                          </block>
                        </value>
                      </block>
                    </statement>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`,

  // Challenge C Solution: Draw a Shape & Predict (Pinch ON + Circle, Triangle, Square)
  challengeC: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ai_draw_trail" x="240" y="40">
    <field name="STATE">true</field>
    <next>
      <block type="controls_if">
        <value name="IF0">
          <block type="logic_compare">
            <field name="OP">EQ</field>
            <value name="A">
              <block type="ai_sensor">
                <field name="FEATURE">shape</field>
              </block>
            </value>
            <value name="B">
              <block type="ai_shape_value">
                <field name="SHAPE">Circle</field>
              </block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="ai_print_text">
            <value name="TEXT">
              <block type="text">
                <field name="TEXT">⭕ Great Circle Detected!</field>
              </block>
            </value>
          </block>
        </statement>
        <next>
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">EQ</field>
                <value name="A">
                  <block type="ai_sensor">
                    <field name="FEATURE">shape</field>
                  </block>
                </value>
                <value name="B">
                  <block type="ai_shape_value">
                    <field name="SHAPE">Triangle</field>
                  </block>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="ai_print_text">
                <value name="TEXT">
                  <block type="text">
                    <field name="TEXT">🔺 Triangle Detected!</field>
                  </block>
                </value>
              </block>
            </statement>
            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="logic_compare">
                    <field name="OP">EQ</field>
                    <value name="A">
                      <block type="ai_sensor">
                        <field name="FEATURE">shape</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="ai_shape_value">
                        <field name="SHAPE">Square</field>
                      </block>
                    </value>
                  </block>
                </value>
                <statement name="DO0">
                  <block type="ai_print_text">
                    <value name="TEXT">
                      <block type="text">
                        <field name="TEXT">🟩 Square Detected!</field>
                      </block>
                    </value>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`
};

if (typeof window !== 'undefined') {
  window.WorkshopTemplates = WorkshopTemplates;
  window.WorkshopSolutions = WorkshopSolutions;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WorkshopTemplates, WorkshopSolutions };
}
