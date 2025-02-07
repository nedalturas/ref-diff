import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';

function App() {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Team Member 1', references: '' },
    { id: 2, name: 'Team Member 2', references: '' },
  ]);

  // Add a ref for the textarea
  const textareaRefs = useRef({});

  // Function to adjust textarea height
  const adjustTextareaHeight = (id) => {
    const textarea = textareaRefs.current[id];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Rest of your existing functions...
  const addTeamMember = () => {
    if (teamMembers.length < 5) {
      setTeamMembers([
        ...teamMembers,
        {
          id: Math.max(...teamMembers.map((tm) => tm.id)) + 1,
          name: `Team Member ${teamMembers.length + 1}`,
          references: '',
        },
      ]);
    }
  };

  const removeTeamMember = (id) => {
    if (teamMembers.length > 2) {
      setTeamMembers(teamMembers.filter((tm) => tm.id !== id));
    }
  };

  const updateReferences = (id, value) => {
    setTeamMembers(
      teamMembers.map((tm) =>
        tm.id === id ? { ...tm, references: value } : tm
      )
    );
    // Adjust height after content update
    adjustTextareaHeight(id);
  };

  // Your existing helper functions...
  const getDuplicates = () => {
    const allRefs = teamMembers.map((tm) => {
      return tm.references
        .split('\n')
        .map((ref) => ref.trim())
        .filter((ref) => ref !== '');
    });

    const duplicates = new Set();
    const seen = new Set();

    allRefs.forEach((memberRefs) => {
      memberRefs.forEach((ref) => {
        if (seen.has(ref)) {
          duplicates.add(ref);
        }
        seen.add(ref);
      });
    });

    return duplicates;
  };

  const getSelfDuplicates = (references) => {
    const lines = references
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    const selfDuplicates = new Set();
    const seen = new Set();

    lines.forEach((line) => {
      if (seen.has(line)) {
        selfDuplicates.add(line);
      }
      seen.add(line);
    });

    return selfDuplicates;
  };

  const renderReferences = (references) => {
    const crossDuplicates = getDuplicates();
    const selfDuplicates = getSelfDuplicates(references);
    const lines = references.split('\n');

    return lines
      .map((line, index) => {
        const trimmedLine = line.trim();
        const isCrossDuplicate = crossDuplicates.has(trimmedLine);
        const isSelfDuplicate = selfDuplicates.has(trimmedLine);

        let backgroundColor = '';
        let textColor = '';
        let title = '';

        if (isSelfDuplicate) {
          backgroundColor = 'bg-yellow-100';
          textColor = 'text-yellow-700';
          title = 'Duplicate in your list';
        } else if (isCrossDuplicate) {
          backgroundColor = 'bg-red-100';
          textColor = 'text-red-500';
          title = 'Duplicate with other member';
        } else if (trimmedLine) {
          backgroundColor = 'bg-green-100';
        }

        return `<div class="flex" style="min-height: 24px;">
          <div class="w-12 flex-shrink-0 text-right pr-2 text-gray-400 select-none border-r border-gray-200" style="padding-top: 2px;">${
            index + 1
          }</div>
          <div class="flex-1 pl-3 ${backgroundColor} ${textColor}" style="padding: 2px 8px; white-space: pre;" title="${title}">${
          line || ' '
        }</div>
        </div>`;
      })
      .join('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Ref Diff</h1>
            <button
              onClick={addTeamMember}
              disabled={teamMembers.length >= 5}
              className="flex items-center gap-2 px-4 py-2 bg-[#00c3ff] text-white rounded-md hover:bg-[#1385a8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle size={20} />
              Add Member
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {teamMembers.map((tm) => (
              <div
                key={tm.id}
                className="border rounded-lg p-4 bg-gray-50 min-w-[400px] flex-1"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tm.name}
                      onChange={(e) =>
                        setTeamMembers(
                          teamMembers.map((m) =>
                            m.id === tm.id ? { ...m, name: e.target.value } : m
                          )
                        )
                      }
                      className="text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                    {teamMembers.length > 2 && (
                      <button
                        onClick={() => removeTeamMember(tm.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <MinusCircle size={20} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative font-mono text-sm border rounded-md bg-white h-96">
                  <textarea
                    value={tm.references}
                    onChange={(e) => updateReferences(tm.id, e.target.value)}
                    placeholder="Enter references (one per line)"
                    className="absolute top-0 left-0 w-full h-full p-0 pl-[3.5rem] pt-[2px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none overflow-y-auto"
                    style={{
                      lineHeight: '24px',
                      caretColor: 'black',
                      color: 'transparent', // Hide the text to avoid doubling
                      fontFamily: 'sans-serif',
                      fontSize: 'inherit',
                    }}
                    onScroll={(e) => {
                      const div = e.target.nextElementSibling;
                      if (div) {
                        div.scrollTop = e.target.scrollTop;
                      }
                    }}
                  />
                  <div
                    className="w-full h-full overflow-y-auto pointer-events-none"
                    onScroll={(e) => {
                      const textarea = e.target.previousElementSibling;
                      if (textarea) {
                        textarea.scrollTop = e.target.scrollTop;
                      }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderReferences(tm.references),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Instructions:
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Enter references one per line for each team member</li>
              <li>
                Duplicate references within your list will be highlighted in
                <span className="bg-yellow-100 text-yellow-700"> yellow </span>
              </li>
              <li>
                Duplicate references with other members will be highlighted in
                <span className="bg-red-100 text-red-700"> red</span>
              </li>
              <li>
                Unique references will have a{' '}
                <span className="bg-green-100 text-green-700">green</span>{' '}
                background
              </li>
              <li>You can add up to 5 team members</li>
              <li>Click the minus button to remove a team member</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
